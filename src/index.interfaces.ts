/// <reference path="../typings/tsd.d.ts" />

export interface ISynset {
  config: Object,
  data: {
    senses: string[]
  }
}

export interface IVMScope extends angular.IScope {
  vm : Object;
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
sentence: represents everything contained by punctuations.
context: represents ten chars "in both directions" from the word.
 */
export interface ISenseTag {
  userEmail: string,
  senseid: string,
  sentence: string,
  context: string
}

