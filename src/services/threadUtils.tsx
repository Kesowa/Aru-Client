import { createContext, useState } from "react";

export interface IThreadState {
  open: boolean;
  docType: string;
  docId: string;
  tags: any,
};

const defaultInit = {
    open: false,
    docType: "",
    docId: "",
    tags: {}
};

export const useThread = (init: IThreadState = defaultInit) => {
    const [thread, setThread] = useState<IThreadState>(init);
    const openThread = (
        docType: string,
        docId: string,
        tags: any,
    ) => { setThread({
        open: true,
        docType,
        docId,
        tags
    }) };
    const closeThread = () => { setThread(defaultInit) };
    return { thread, openThread, closeThread };
}

export const ThreadContext = createContext<{
    thread: IThreadState;
    openThread: (dType: string, dId: string, tags: any) => void;
    closeThread: () => void;
}>({
    thread: defaultInit,
    openThread: (dType, dId, tags) => {},
    closeThread: () => {},
});