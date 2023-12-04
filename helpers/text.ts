import { ChatOpenAI } from "langchain/chat_models/openai";
import { Document } from "langchain/document";
import { HumanMessage } from "langchain/schema";

const _getParagraphs = (text: string) => text.match(/[^]+?(?=\n\n|$)/g) ?? [];

export const getTokenCount = async (chat: ChatOpenAI, text: string, estimateTokens: boolean) => {
    if (estimateTokens) {
        const { totalCount } = await chat.getNumTokensFromMessages([new HumanMessage(text)]);
        return totalCount;
    }

    return text.length;
};

export const split = async (chat: ChatOpenAI, text: string, size = 500, estimateTokens = false) => {
    const documents = [];
    let document = '';

    const paragraphs = _getParagraphs(text);

    for (const paragraph of paragraphs) {
        if (!paragraph.trim()) continue;

        const tokens = await getTokenCount(chat, document + paragraph, estimateTokens);

        if (tokens > size && document.trim()) {
            documents.push(new Document({ pageContent: document.trim() }));
            document = paragraph;
        } else {
            document += (document ? ' ' : '') + paragraph;
        }
    }

    if (document.trim()) {
        documents.push(new Document({ pageContent: document.trim() }));
    }

    return documents;
};