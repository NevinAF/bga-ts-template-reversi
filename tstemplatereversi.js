var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define("bgagame/tstemplatereversi", ["require", "exports", "ebg/core/gamegui", "ebg/counter"], function (require, exports, Gamegui) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TSTemplateReversi = (function (_super) {
        __extends(TSTemplateReversi, _super);
        function TSTemplateReversi() {
            var _this = _super.call(this) || this;
            console.log('tstemplatereversi constructor');
            return _this;
        }
        TSTemplateReversi.prototype.setup = function (gamedatas) {
            console.log("Starting game setup");
            this.addTokenOnBoard(2, 2, this.player_id);
            this.addTokenOnBoard(6, 3, this.player_id);
            this.setupNotifications();
        };
        TSTemplateReversi.prototype.onEnteringState = function (stateName, args) {
            console.log('Entering state: ' + stateName);
            switch (stateName) {
                case 'dummmy':
                    break;
            }
        };
        TSTemplateReversi.prototype.onLeavingState = function (stateName) {
            console.log('Leaving state: ' + stateName);
            switch (stateName) {
                case 'dummmy':
                    break;
            }
        };
        TSTemplateReversi.prototype.onUpdateActionButtons = function (stateName, args) {
            console.log('onUpdateActionButtons: ' + stateName, args);
            if (!this.isCurrentPlayerActive())
                return;
            switch (stateName) {
                case 'dummmy':
                    break;
            }
        };
        TSTemplateReversi.prototype.addTokenOnBoard = function (x, y, player_id) {
            var player = this.gamedatas.players[player_id];
            if (!player)
                throw new Error('Unknown player id: ' + player_id);
            dojo.place(this.format_block('jstpl_token', {
                x_y: "".concat(x, "_").concat(y),
                color: player.color
            }), 'board');
            this.placeOnObject("token_".concat(x, "_").concat(y), "overall_player_board_".concat(player_id));
            this.slideToObject("token_".concat(x, "_").concat(y), "square_".concat(x, "_").concat(y)).play();
        };
        TSTemplateReversi.prototype.setupNotifications = function () {
            console.log('notifications subscriptions setup');
        };
        return TSTemplateReversi;
    }(Gamegui));
    dojo.setObject("bgagame.tstemplatereversi", TSTemplateReversi);
});
