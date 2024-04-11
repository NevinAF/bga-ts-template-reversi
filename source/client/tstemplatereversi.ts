/*
 *------
 * BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
 * TSTemplateReversi implementation : © Nevin Foster, nevin.foster2@gmail.com
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 */
/// <amd-module name="bgagame/tstemplatereversi"/>

import Gamegui = require('ebg/core/gamegui');
import "ebg/counter";

/** The root for all of your game code. */
class TSTemplateReversi extends Gamegui
{
	// myGlobalValue: number = 0;
	// myGlobalArray: string[] = [];

	/** @gameSpecific See {@link Gamegui} for more information. */
	constructor(){
		super();
		console.log('tstemplatereversi constructor');
	}

	/** @gameSpecific See {@link Gamegui.setup} for more information. */
	setup(gamedatas: Gamedatas): void
	{
		console.log( "Starting game setup" );

		// Place the tokens on the board
		for( let i in gamedatas.board )
		{
			let square = gamedatas.board[i];

			if( square?.player ) // If square is defined and has a player
				this.addTokenOnBoard( square.x, square.y, square.player );
		}

		this.setupNotifications(); // <-- Keep this line
	}

	///////////////////////////////////////////////////
	//// Game & client states
	
	/** @gameSpecific See {@link Gamegui.onEnteringState} for more information. */
	onEnteringState(stateName: GameStateName, args: CurrentStateArgs): void
	{
		console.log( 'Entering state: '+stateName );
	}

	/** @gameSpecific See {@link Gamegui.onLeavingState} for more information. */
	onLeavingState(stateName: GameStateName): void
	{
		console.log( 'Leaving state: '+stateName );
	}

	/** @gameSpecific See {@link Gamegui.onUpdateActionButtons} for more information. */
	onUpdateActionButtons(stateName: GameStateName, args: AnyGameStateArgs | null): void
	{
		console.log( 'onUpdateActionButtons: ' + stateName, args );
	}

	///////////////////////////////////////////////////
	//// Utility methods

	/** Adds a token matching the given player to the board at the specified location. */
	addTokenOnBoard( x: number, y: number, player_id: number )
	{
		let player = this.gamedatas.players[ player_id ];
		if (!player)
			throw new Error( 'Unknown player id: ' + player_id );

		dojo.place( this.format_block( 'jstpl_token', {
			x_y: `${x}_${y}`,
			color: player.color
		} ) , 'board' );

		this.placeOnObject( `token_${x}_${y}`, `overall_player_board_${player_id}` );
		this.slideToObject( `token_${x}_${y}`, `square_${x}_${y}` ).play();
	}

	///////////////////////////////////////////////////
	//// Player's action
	
	/*
		Here, you are defining methods to handle player's action (ex: results of mouse click on game objects).
		
		Most of the time, these methods:
		- check the action is possible at this game state.
		- make a call to the game server
	*/
	
	/*
	Example:
	onMyMethodToCall1( evt: Event )
	{
		console.log( 'onMyMethodToCall1' );

		// Preventing default browser reaction
		evt.preventDefault();

		//	With base Gamegui class...

		// Check that this action is possible (see "possibleactions" in states.inc.php)
		if(!this.checkAction( 'myAction' ))
			return;

		this.ajaxcall( "/yourgamename/yourgamename/myAction.html", { 
			lock: true, 
			myArgument1: arg1,
			myArgument2: arg2,
		}, this, function( result ) {
			// What to do after the server call if it succeeded
			// (most of the time: nothing)
		}, function( is_error) {

			// What to do after the server call in anyway (success or failure)
			// (most of the time: nothing)
		} );


		//	With GameguiCookbook::Common...
		this.ajaxAction( 'myAction', { myArgument1: arg1, myArgument2: arg2 }, (is_error) => {} );
	}
	*/

	///////////////////////////////////////////////////
	//// Reaction to cometD notifications

	/** @gameSpecific See {@link Gamegui.setupNotifications} for more information. */
	setupNotifications()
	{
		console.log( 'notifications subscriptions setup' );
		
		// TODO: here, associate your game notifications with local methods
		
		// With base Gamegui class...
		// dojo.subscribe( 'cardPlayed', this, "notif_cardPlayed" );

		// With GameguiCookbook::Common class...
		// this.subscribeNotif( 'cardPlayed', this.notif_cardPlayed ); // Adds type safety to the subscription
	}

	/*
	Example:
	
	// The argument here should be one of there things:
	// - `Notif`: A notification with all possible arguments defined by the NotifTypes interface. See {@link Notif}.
	// - `NotifFrom<'cardPlayed'>`: A notification matching any other notification with the same arguments as 'cardPlayed' (A type can be used here instead). See {@link NotifFrom}.
	// - `NotifAs<'cardPlayed'>`: A notification that is explicitly a 'cardPlayed' Notif. See {@link NotifAs}.
	notif_cardPlayed( notif: NotifFrom<'cardPlayed'> )
	{
		console.log( 'notif_cardPlayed', notif );
		// Note: notif.args contains the arguments specified during you "notifyAllPlayers" / "notifyPlayer" PHP call
	}
	*/
}


// The global 'bgagame.tstemplatereversi' class is instantiated when the page is loaded. The following code sets this variable to your game class.
dojo.setObject( "bgagame.tstemplatereversi", TSTemplateReversi );
// Same as: (window.bgagame ??= {}).tstemplatereversi = TSTemplateReversi;