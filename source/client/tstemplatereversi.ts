/*
 *------
 * BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
 * TSTemplatereversi implementation : © ___developers___
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 */

/**
 * See {@link ../___source-to-template___/docs/typescript/index.md} for a LOT more information on this file.
 * The file include alternative ways to structure this file, how to break it up into multiple files, and more.
 */

// Defines the name of this module. Same as putting this code into a file at path: bgagame/tstemplatereversi.ts
/// <amd-module name="bgagame/tstemplatereversi"/>

import Gamegui = require('ebg/core/gamegui');
import "ebg/counter";

/** See {@link BGA.Gamegui} for more information. */
class TSTemplatereversi extends Gamegui
{
	// myGlobalValue: number = 0;
	// myGlobalArray: string[] = [];

	/** See {@link BGA.Gamegui} for more information. */
	constructor(){
		super();
		console.log('tstemplatereversi constructor');
	}

	/** See {@link  BGA.Gamegui#setup} for more information. */
	setup(gamedatas: BGA.Gamedatas): void
	{
		console.log( "Starting game setup" );

		// Place the tokens on the board
		for( let i in gamedatas.board )
		{
			let square = gamedatas.board[i];

			if( square?.player ) // If square is defined and has a player
				this.addTokenOnBoard( square.x, square.y, square.player );
		}

		dojo.query<HTMLElement>( '.square' ).connect( 'onclick', this, 'onPlayDisc' );

		this.setupNotifications(); // <-- Keep this line
	}

	///////////////////////////////////////////////////
	//// Game & client states
	
	/** See {@link BGA.Gamegui#onEnteringState} for more information. */
	override onEnteringState(...[stateName, state]: BGA.GameStateTuple<['name', 'state']>): void
	{
		console.log( 'Entering state: ' + stateName );

		switch( stateName )
		{
			case 'playerTurn':
				this.updatePossibleMoves( state.args.possibleMoves );
				break;
		}
	}

	/** See {@link BGA.Gamegui#onLeavingState} for more information. */
	override onLeavingState(stateName: BGA.ActiveGameState["name"]): void
	{
		console.log( 'Leaving state: ' + stateName );
	}

	/** See {@link BGA.Gamegui#onUpdateActionButtons} for more information. */
	override onUpdateActionButtons(...[stateName, args]: BGA.GameStateTuple<['name', 'args']>): void
	{
		console.log( 'onUpdateActionButtons: ' + stateName, args );
	}

	///////////////////////////////////////////////////
	//// Utility methods

	/** Adds a token matching the given player to the board at the specified location. */
	addTokenOnBoard( x: number, y: number, player_id: BGA.ID )
	{
		let player = this.gamedatas!.players[ player_id ];
		if (!player)
			throw new Error( 'Unknown player id: ' + player_id );

		dojo.place( this.format_block( 'jstpl_token', {
			x_y: `${x}_${y}`,
			color: player.color
		} ) , 'board' );

		this.placeOnObject( `token_${x}_${y}`, `overall_player_board_${player_id}` );
		this.slideToObject( `token_${x}_${y}`, `square_${x}_${y}` ).play();
	}

	/** Removes the 'possibleMove' class from all elements. */
	clearPossibleMoves() {
		document.querySelectorAll('.possibleMove').forEach(element => {
			element.classList.remove('possibleMove');
		});
	}

	/** Updates the squares on the board matching the possible moves. */
	updatePossibleMoves( possibleMoves: boolean[][] )
	{
		this.clearPossibleMoves();

		for( var x in possibleMoves )
		{
			for( var y in possibleMoves[ x ] )
			{
				let square = $(`square_${x}_${y}`);
				if( !square )
					throw new Error( `Unknown square element: ${x}_${y}. Make sure the board grid was set up correctly in the tpl file.` );
				square.classList.add('possibleMove');
			}
		}

		this.addTooltipToClass( 'possibleMove', '', _('Place a disc here') );
	}

	///////////////////////////////////////////////////
	//// Player's action
	
	/** Called when a square is clicked, check if it is a possible move and send the action to the server. */
	onPlayDisc( evt: Event )
	{
		// Stop this event propagation
		evt.preventDefault();

		if (!(evt.currentTarget instanceof HTMLElement))
			throw new Error('evt.currentTarget is null! Make sure that this function is being connected to a DOM HTMLElement.');

		// Check if this is a possible move
		if( !evt.currentTarget.classList.contains('possibleMove') )
			return;

		// Check that this action is possible at this moment (shows error dialog if not possible)
		if( !this.checkAction( 'playDisc' ) )
			return;

		// Get the clicked square x and y
		// Note: square id format is "square_X_Y"
		let [_square_, x, y] = evt.currentTarget.id.split('_');

		this.ajaxcall( `/${this.game_name}/${this.game_name}/playDisc.html`, {
			x: Number(x),
			y: Number(y),
			lock: true
		}, this, function() {} );
	}

	///////////////////////////////////////////////////
	//// Reaction to cometD notifications

	/** See {@link BGA.Gamegui#setupNotifications} for more information. */
	override setupNotifications = () =>
	{
		console.log( 'notifications subscriptions setup' );

		dojo.subscribe( 'playDisc', this, "notif_playDisc" );
		this.notifqueue.setSynchronous( 'playDisc', 500 );
		dojo.subscribe( 'turnOverDiscs', this, "notif_turnOverDiscs" );
		this.notifqueue.setSynchronous( 'turnOverDiscs', 1000 );
		dojo.subscribe( 'newScores', this, "notif_newScores" );
		this.notifqueue.setSynchronous( 'newScores', 500 );
	}

	notif_playDisc( notif: BGA.Notif<'playDisc'> )
	{
		this.clearPossibleMoves();
		this.addTokenOnBoard( notif.args.x, notif.args.y, notif.args.player_id );
	}

	notif_turnOverDiscs( notif: BGA.Notif<'turnOverDiscs'> )
	{
		// Change the color of the turned over discs
		for( var i in notif.args.turnedOver )
		{
			let token_data = notif.args.turnedOver[ i ]!;
			let token = $<HTMLElement>( `token_${token_data.x}_${token_data.y}` );

			if (!token)
				throw new Error( `Unknown token element: ${token_data.x}_${token_data.y}. Make sure the board grid was set up correctly in the tpl file.` );

			token.classList.toggle('tokencolor_cbcbcb');
			token.classList.toggle('tokencolor_363636');
		}
	}

	notif_newScores( notif: BGA.Notif<'newScores'> )
	{
		for( var player_id in notif.args.scores )
		{
			let counter = this.scoreCtrl[ player_id ];
			let newScore = notif.args.scores[ player_id ];
			if (counter && newScore)
				counter.toValue( newScore );
		}
	}
}


// The global 'bgagame.tstemplatereversi' class is instantiated when the page is loaded and used as the Gamegui.
bgagame = { tstemplatereversi: TSTemplatereversi };