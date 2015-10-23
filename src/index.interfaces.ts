/// <reference path="../typings/tsd.d.ts" />

module tagIt {

  export interface synsetJson {
    config: Object,
    data: {
      senses: string[]
    }
  }

  export interface tagItAngularScope extends angular.IScope {
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

}

