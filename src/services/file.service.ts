/// <reference path="../index.interfaces.ts" />

'use strict';

//Responsible for saving.
module tagIt {

  export class FileService {

    $log: ng.ILogService;

    /* @ngInject */
    constructor($log: ng.ILogService) {
      this.$log = $log;
    }

    saveFile(content: ISenseTag[]) {
      var json = JSON.stringify(content, null, 2);
      var blob = new Blob([json], { type: "application/json" });
      var url = URL.createObjectURL(blob);
      var a = <any> document.createElement('a');
      var date = new Date();
      a.download = `tags downloaded for ${window.location.hostname} time of download ${date.toLocaleString()}.json`;
      a.href = url;
      a.click();
    }

  }
}