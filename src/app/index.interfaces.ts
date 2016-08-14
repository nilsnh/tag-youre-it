
export interface ISynset {
  config: Object,
  data: {
    senses: string[]
  }
}

export interface IVMScope extends angular.IRootScopeService {
  vm: Object;
}

export interface ISense {
  explanation: string,
  rank: number,
  related: string,
  senseid: string,
  source: string,
  word: string
}

/*
context: represents the text context of the tag
selectionRange: selectionRangeObject
 */
export interface ISenseTag {
  id: string,
  userEmail: string;
  sense: ISense;
  context: string;
  iframeIndex: number;
  wordThatWasTagged: string;
  serializedSelectionRange: string;
  deserializedRange?: Range;
  urlOfPageThatWasTagged: string;
}

