"use strict";

module.exports = {

    createStat: function(itemInfo) {
        return {
            isFile: function() {
                return itemInfo.type === "file";
            },
            isDirectory: function() {
                return itemInfo.type === "directory";
            },
            mtime: new Date(itemInfo.lastmod),
            size: itemInfo.size || 0
        };
    }

};
