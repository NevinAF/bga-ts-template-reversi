<?php
declare(strict_types=1);
/*
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. ANY CHANGES MADE DIRECTLY MAY BE OVERWRITTEN.
 *------
 * BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
 * TSTemplateReversi implementation : © Nevin Foster, nevin.foster2@gmail.com
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 */

/**
 * TYPE CHECKING ONLY, this function is never called.
 * If there are any undefined function errors here, you MUST rename the action within the game states file, or create the function in the game class.
 * If the function does not match the parameters correctly, you are either calling an invalid function, or you have incorrectly added parameters to a state function.
 */
if (false) {
	/** @var tstemplatereversi $game */
	$game->stNextPlayer();
}

$machinestates = array(
	1 => array(
		'name' => 'gameSetup',
		'description' => '',
		'type' => 'manager',
		'action' => 'stGameSetup',
		'transitions' => array(
			'' => 10,
		),
	),
	10 => array(
		'name' => 'playerTurn',
		'description' => clienttranslate('${actplayer} must play a disc'),
		'descriptionmyturn' => clienttranslate('${you} must play a disc'),
		'type' => 'activeplayer',
		'args' => 'argPlayerTurn',
		'possibleactions' => ['playDisc'],
		'transitions' => array(
			'playDisc' => 11,
			'zombiePass' => 11,
		),
	),
	11 => array(
		'name' => 'nextPlayer',
		'type' => 'game',
		'action' => 'stNextPlayer',
		'updateGameProgression' => true,
		'transitions' => array(
			'nextTurn' => 10,
			'cantPlay' => 11,
			'endGame' => 99,
		),
		'description' => '',
	),
	99 => array(
		'name' => 'gameEnd',
		'description' => clienttranslate('End of game'),
		'type' => 'manager',
		'action' => 'stGameEnd',
		'args' => 'argGameEnd',
	),
);