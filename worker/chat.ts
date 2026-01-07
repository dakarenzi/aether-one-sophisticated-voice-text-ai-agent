import OpenAI from 'openai';
import type { Message, ToolCall } from './types';
import { getToolDefinitions, executeTool } from './tools';
import { ChatCompletionMessageFunctionToolCall } from 'openai/resources/index.mjs';

/**
 * ChatHandler - Handles all chat-related operations
 * 
 * This class encapsulates the OpenAI integration and tool execution logic,
 * making it easy for AI developers to understand and extend the functionality.
 */
export class ChatHandler {
  private client?: OpenAI;
  private model: string;
  private mockMode: boolean = false;

  constructor(aiGatewayUrl: string, apiKey: string, model: string) {
    this.mockMode = !aiGatewayUrl?.includes('gate.ai.cloudflare.com') || 
                    aiGatewayUrl?.includes('YOUR_ACCOUNT') || 
                    aiGatewayUrl?.includes('build.cloudflare.dev') || 
                    !apiKey?.startsWith('sk-') || 
                    apiKey?.includes('YOUR');
    if (this.mockMode) {
      console.log('Mock mode activated due to invalid AI gateway config:', aiGatewayUrl, apiKey ? 'key-present' : 'no-key');
      console.log('Note: Limited AI requests available across all user apps.');
      this.model = model;
      return;
    }

    this.client = new OpenAI({
      baseURL: aiGatewayUrl,
      apiKey: apiKey
    });
    console.log("BASE URL", aiGatewayUrl);
    this.model = model;
  }

  /**
   * Process a user message and generate AI response with optional tool usage
   */
  async processMessage(
    message: string,
    conversationHistory: Message[],
    onChunk?: (chunk: string) => void
  ): Promise<{
    content: string;
    toolCalls?: ToolCall[];
  }> {
    if (this.mockMode) {
      const fallbackContent = `Hello! You mentioned: "${message}". Fallback active - AI Gateway unavailable. Limited requests to AI servers per time period across all user apps.`;
      if (onChunk) {
        // Simulate streaming: split into words, call onChunk every 100ms
        const words = fallbackContent.split(' ');
        for (const word of words) {
          await new Promise(r => setTimeout(r, 100));
          onChunk(word + ' ');
        }
      }
      return { content: fallbackContent };
    }

    const messages = this.buildConversationMessages(message, conversationHistory);
    const toolDefinitions = await getToolDefinitions();
    
    if (onChunk) {
      // Use streaming with callback
      const stream = await this.client!.chat.completions.create({
        model: this.model,
        messages,
        tools: toolDefinitions,
        tool_choice: 'auto',
        max_completion_tokens: 16000,
        stream: true,
        // reasoning_effort: 'low'
      });

      return this.handleStreamResponse(stream, message, conversationHistory, onChunk);
    }

    // Non-streaming response
    const completion = await this.client!.chat.completions.create({
      model: this.model,
      messages,
      tools: toolDefinitions,
      tool_choice: 'auto',
      max_tokens: 16000,
      stream: false
    });

    return this.handleNonStreamResponse(completion, message, conversationHistory);
  }

  private async handleStreamResponse(
    stream: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>,
    message: string,
    conversationHistory: Message[],
    onChunk: (chunk: string) => void
  ) {
    let fullContent = '';
    const accumulatedToolCalls: ChatCompletionMessageFunctionToolCall[] = [];
    
    try {
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;
        
        if (delta?.content) {
          fullContent += delta.content;
          onChunk(delta.content);
        }
        
        // Accumulate tool calls from streaming chunks
        if (delta?.tool_calls) {
          for (let i = 0; i < delta.tool_calls.length; i++) {
            const deltaToolCall = delta.tool_calls[i];
            if (!accumulatedToolCalls[i]) {
              accumulatedToolCalls[i] = {
                id: deltaToolCall.id || `tool_${Date.now()}_${i}`,
                type: 'function',
                function: {
                  name: deltaToolCall.function?.name || '',
                  arguments: deltaToolCall.function?.arguments || ''
                }
              };
            } else {
              // Append to existing tool call
              if (deltaToolCall.function?.name && !accumulatedToolCalls[i].function.name) {
                accumulatedToolCalls[i].function.name = deltaToolCall.function.name;
              }
              if (deltaToolCall.function?.arguments) {
                accumulatedToolCalls[i].function.arguments += deltaToolCall.function.arguments;
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Stream processing error:', error);
      throw new Error('Stream processing failed');
    }
    
    if (accumulatedToolCalls.length > 0) {
      const executedTools = await this.executeToolCalls(accumulatedToolCalls);
      const finalResponse = await this.generateToolResponse(message, conversationHistory, accumulatedToolCalls, executedTools);
      return { content: finalResponse, toolCalls: executedTools };
    }
    
    return { content: fullContent };
  }

  private async handleNonStreamResponse(
    completion: OpenAI.Chat.Completions.ChatCompletion,
    message: string,
    conversationHistory: Message[]
  ) {
    const responseMessage = completion.choices[0]?.message;
    
    if (!responseMessage) {
      return { content: 'I apologize, but I encountered an issue processing your request.' };
    }

    if (!responseMessage.tool_calls) {
      return { 
        content: responseMessage.content || 'I apologize, but I encountered an issue.' 
      };
    }

    const toolCalls = await this.executeToolCalls(responseMessage.tool_calls as ChatCompletionMessageFunctionToolCall[]);
    const finalResponse = await this.generateToolResponse(
      message, 
      conversationHistory, 
      responseMessage.tool_calls, 
      toolCalls
    );

    return { content: finalResponse, toolCalls };
  }

  /**
   * Execute all tool calls from OpenAI response
   */
  private async executeToolCalls(openAiToolCalls: ChatCompletionMessageFunctionToolCall[]): Promise<ToolCall[]> {
    return Promise.all(
      openAiToolCalls.map(async (tc) => {
        try {
          const args = tc.function.arguments ? JSON.parse(tc.function.arguments) : {};
          const result = await executeTool(tc.function.name, args);
          return {
            id: tc.id,
            name: tc.function.name,
            arguments: args,
            result
          };
        } catch (error) {
          console.error(`Tool execution failed for ${tc.function.name}:`, error);
          return {
            id: tc.id,
            name: tc.function.name,
            arguments: {},
            result: { error: `Failed to execute ${tc.function.name}: ${error instanceof Error ? error.message : 'Unknown error'}` }
          };
        }
      })
    );
  }

  /**
   * Generate final response after tool execution
   */
  private async generateToolResponse(
    userMessage: string, 
    history: Message[], 
    openAiToolCalls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[], 
    toolResults: ToolCall[]
  ): Promise<string> {
    const followUpCompletion = await this.client!.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: 'You are a helpful AI assistant. Respond naturally to the tool results.' },
        ...history.slice(-3).map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: userMessage },
        { 
          role: 'assistant', 
          content: null,
          tool_calls: openAiToolCalls
        },
        ...toolResults.map((result, index) => ({
          role: 'tool' as const,
          content: JSON.stringify(result.result),
          tool_call_id: openAiToolCalls[index]?.id || result.id
        }))
      ],
      max_tokens: 16000
    });

    return followUpCompletion.choices[0]?.message?.content || 'Tool results processed successfully.';
  }

  /**
   * Build conversation messages for OpenAI API
   */
  private buildConversationMessages(userMessage: string, history: Message[]) {
    return [
      {
        role: 'system' as const,
        content: `You are Aether, a sophisticated voice-first AI agent.
        Your goal is to be a helpful companion.
        CRITICAL VOICE GUIDELINES:
        - Keep responses CONCISE and natural for speech.
        - Avoid complex Markdown tables, long bulleted lists, or excessive technical jargon.
        - Use short sentences and clear transitions.
        - If you use a tool, briefly explain what you found in 1-2 sentences.
        - Never use visual-only formatting like LaTeX or large code blocks unless explicitly asked.
        - Act as if you are speaking directly to the user through their speakers.
        - Current interaction mode: Multimodal Voice & Text Interface.
        - Be direct, polite, and efficient.`
      },
      ...history.slice(-5).map(m => ({
        role: m.role,
        content: m.content 
      })),
      { role: 'user' as const, content: userMessage }
    ];
  }

  /**
   * Transcribe audio file to text using Whisper
   */
  public async transcribeAudio(audioFile: File): Promise<string> {
    if (this.mockMode) {
      return 'Fallback transcription unavailable - AI Gateway not configured.';
    }
    const bytes = await audioFile.arrayBuffer();
    const transcription = await this.client!.audio.transcriptions.create({
      model: 'whisper-1',
      file: new File([bytes], 'audio.webm'),
      language: 'en',
      response_format: 'text'
    });
    return transcription;
  }

  /**
   * Synthesize text to speech audio
   */
  public async synthesizeSpeech(text: string): Promise<Blob> {
    if (this.mockMode) {
      throw new Error('Fallback TTS unavailable - AI Gateway not configured.');
    }
    const speech = await this.client!.audio.speech.create({
      model: 'tts-1',
      voice: 'alloy',
      input: text
    });
    return new Blob([await speech.arrayBuffer()], { type: 'audio/mpeg' });
  }

  /**
   * Update the model for this chat handler
   */
  updateModel(newModel: string): void {
    this.model = newModel;
  }
}