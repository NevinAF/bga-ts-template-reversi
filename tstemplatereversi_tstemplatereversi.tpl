{OVERALL_GAME_HEADER}

<!-- 
--------
-- BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
-- TSTemplateReversi implementation : © Nevin Foster, nevin.foster2@gmail.com
-- 
-- This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
-- See http://en.boardgamearena.com/#!doc/Studio for more information.
--------
-->


<div id="board">
	<!-- BEGIN square -->
	<div id="square_{X}_{Y}" class="square" style="left: {LEFT}px; top: {TOP}px;"></div>
	<!-- END square -->
</div>


<script type="text/javascript">

var jstpl_token='<div class="token tokencolor_${color}" id="token_${x_y}"></div>';

</script>

{OVERALL_GAME_FOOTER}
