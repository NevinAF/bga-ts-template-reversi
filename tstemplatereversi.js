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
            _this.setupNotifications = function () {
                console.log('notifications subscriptions setup');
                dojo.subscribe('playDisc', _this, "notif_playDisc");
                _this.notifqueue.setSynchronous('playDisc', 500);
                dojo.subscribe('turnOverDiscs', _this, "notif_turnOverDiscs");
                _this.notifqueue.setSynchronous('turnOverDiscs', 1000);
                dojo.subscribe('newScores', _this, "notif_newScores");
                _this.notifqueue.setSynchronous('newScores', 500);
            };
            console.log('tstemplatereversi constructor');
            return _this;
        }
        TSTemplateReversi.prototype.setup = function (gamedatas) {
            console.log("Starting game setup");
            for (var i in gamedatas.board) {
                var square = gamedatas.board[i];
                if (square === null || square === void 0 ? void 0 : square.player)
                    this.addTokenOnBoard(square.x, square.y, square.player);
            }
            dojo.query('.square').connect('onclick', this, 'onPlayDisc');
            this.setupNotifications();
        };
        TSTemplateReversi.prototype.onEnteringState = function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var stateName = _a[0], state = _a[1];
            console.log('Entering state: ' + stateName);
            switch (stateName) {
                case 'playerTurn':
                    this.updatePossibleMoves(state.args.possibleMoves);
                    break;
            }
        };
        TSTemplateReversi.prototype.onLeavingState = function (stateName) {
            console.log('Leaving state: ' + stateName);
        };
        TSTemplateReversi.prototype.onUpdateActionButtons = function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var stateName = _a[0], args = _a[1];
            console.log('onUpdateActionButtons: ' + stateName, args);
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
        TSTemplateReversi.prototype.clearPossibleMoves = function () {
            document.querySelectorAll('.possibleMove').forEach(function (element) {
                element.classList.remove('possibleMove');
            });
        };
        TSTemplateReversi.prototype.updatePossibleMoves = function (possibleMoves) {
            this.clearPossibleMoves();
            for (var x in possibleMoves) {
                for (var y in possibleMoves[x]) {
                    var square = $("square_".concat(x, "_").concat(y));
                    if (!square)
                        throw new Error("Unknown square element: ".concat(x, "_").concat(y, ". Make sure the board grid was set up correctly in the tpl file."));
                    square.classList.add('possibleMove');
                }
            }
            this.addTooltipToClass('possibleMove', '', _('Place a disc here'));
        };
        TSTemplateReversi.prototype.onPlayDisc = function (evt) {
            evt.preventDefault();
            if (!(evt.currentTarget instanceof HTMLElement))
                throw new Error('evt.currentTarget is null! Make sure that this function is being connected to a DOM HTMLElement.');
            if (!evt.currentTarget.classList.contains('possibleMove'))
                return;
            if (!this.checkAction('playDisc'))
                return;
            var _a = evt.currentTarget.id.split('_'), _square_ = _a[0], x = _a[1], y = _a[2];
            this.ajaxcall("/".concat(this.game_name, "/").concat(this.game_name, "/playDisc.html"), {
                x: Number(x),
                y: Number(y),
                lock: true
            }, this, function () { });
        };
        TSTemplateReversi.prototype.notif_playDisc = function (notif) {
            this.clearPossibleMoves();
            this.addTokenOnBoard(notif.args.x, notif.args.y, notif.args.player_id);
        };
        TSTemplateReversi.prototype.notif_turnOverDiscs = function (notif) {
            for (var i in notif.args.turnedOver) {
                var token_data = notif.args.turnedOver[i];
                var token = $("token_".concat(token_data.x, "_").concat(token_data.y));
                if (!token)
                    throw new Error("Unknown token element: ".concat(token_data.x, "_").concat(token_data.y, ". Make sure the board grid was set up correctly in the tpl file."));
                token.classList.toggle('tokencolor_cbcbcb');
                token.classList.toggle('tokencolor_363636');
            }
        };
        TSTemplateReversi.prototype.notif_newScores = function (notif) {
            for (var player_id in notif.args.scores) {
                var counter = this.scoreCtrl[player_id];
                var newScore = notif.args.scores[player_id];
                if (counter && newScore)
                    counter.toValue(newScore);
            }
        };
        return TSTemplateReversi;
    }(Gamegui));
    dojo.setObject("bgagame.tstemplatereversi", TSTemplateReversi);
});
