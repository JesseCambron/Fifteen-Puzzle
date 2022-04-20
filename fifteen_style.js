function addButtons() {
  "use strict";

  var buttonsArr = [],
  i,
  linkAttribute,
  imgAttribute;
  // Get the div created for output
  var buttonDiv = document.createElement("DIV");
  

  for(i=0; i<3;i++){
      buttonsArr[i] = document.createElement("A");
      imgAttribute = document.createElement("IMG");

      imgAttribute.className = "validations";
      if(0 === i%3){
          // htmlValidationButton
          imgAttribute.setAttribute("src", "./valid-html.png");
          buttonsArr[i].href = "https://validator.w3.org/nu";
          imgAttribute.setAttribute("alt", "html validation");
      }else if(1 === i%3){
          // cssValidationButton 
          imgAttribute.setAttribute("src", "./valid-css.png");
          buttonsArr[i].href = "https://jigsaw.w3.org/css-validator";
          imgAttribute.setAttribute("alt", "css validation");
      }  
      buttonsArr[i].appendChild(imgAttribute);
      // buttonsArr[i] = linkAttribute;
      buttonDiv.appendChild(buttonsArr[i]);
  }
  document.body.appendChild(buttonDiv);
}

// Obtain an object representing the puzzle/game board.
var puzzleBoard = (function () {
  "use strict";
  
  /* PRIVATE VARIABLES */
  var board = {},                 // The object to return.
      rowSlots = 4,               // How many slots are displayed per row.
      colSlots = 4,               // How many slots are displayed per column.
      tileLength = 100,           // The width/height of a slot/tile in pixels.
      tileCount,                  // How many tiles should be made.
      emptySlot,                  // The empty slot on the board.
      shuffleButton,              // A reference to the game's shuffle button.
      checkIfGameWon = false,
      hoveredSlots = {},               // An array that holds the currently hovered slots.
      puzzleArea;                 // The div element that will hold the game board.
  
  // Always leave one empty slot for maneuvering tiles.
  tileCount = colSlots * rowSlots - 1;
  
  
  /* PUBLIC VARIABLES */
  board.allTiles = [];            // Holds all tile objects.
  board.allSlots = [];            // Holds all the slots on the game board.
  
  
  /* PRIVATE FUNCTIONS */
  
  // Returns the tile object holding the tile element that was clicked on.
  function getCurrentTile(tileElement) {
      var i;      // Loop variable
      
      // Search the tile's array for tileElement
      for (i = 0; i < board.allTiles.length; i += 1) {
          if (board.allTiles[i].element === tileElement) {
              return board.allTiles[i];
          }
      }
      return undefined;
  }
  
  // THIS FUNCTION IS PROBABLY NOT NECESSARY.
  // Returns the slot that holds the passed in tile object or undefined if the tile is not found.
  function getSlotByTile(thisTile) {
      var i;      // Loop variable.
      
      // Search the slots array until we find the slot holding the tile object.
      for (i = 0; i < board.allSlots; i += 1) {
          if (board.allSlots[i].tile === thisTile) {
              return board.allSlots[i];
          }
      }
      return undefined;
  }
  
  // Returns the slot located at position pRow, pColumn.
  function getSlotByPosition(pRow, pColumn) {
      return board.allSlots[pRow * colSlots + pColumn];
  }
  
  // Returns an array of tile elements that are legally allowed to be moved, based on a tile element that was clicked on.
  function getTilesCanMove(thisTile) {
      var info = {},      // The object to be returned.
          slots = [],     // All the slots that hold movable tiles.
          direction = {}, // Which direction to move the tiles, if they are movable.
          numSlots,       // How many slots are between the one clicked and the empty slot.
          delta,          // Either 1 or -1, depending on the empty slot being farther up/down or left/right of thisTile.
          i;              // Loop variable.
      
      // Initialize the direction object.
      direction.x = 0;
      direction.y = 0;
      
      // Be certain the tile clicked on is itself moveable.
      // Check if thisTile and emptySlot are in the same row.
      if (thisTile.currentRow === emptySlot.row) {
          // Add the slot that holds thisTile the array of moveable tile's slots.
          slots.push(thisTile.currentSlot);
          // How many slots hold tiles between thisTile and emptySlot, including thisTile.
          numSlots = Math.abs((emptySlot.column - thisTile.currentColumn));
          // Determine delta based on emptySlot being farther left or right.
          delta = emptySlot.column - thisTile.currentColumn > 0 ? 1 : -1;
          // Add additional movable tile's slots that are also in this row.
          for (i = 1; i < numSlots; i += 1) {
              slots.push(getSlotByPosition(thisTile.currentRow, thisTile.currentColumn + delta * i));
          }
          // Set the direction value for movement between rows.
          direction.x = delta;
      // Check if thisTile and emptySlot are in the same column.
      } else if (thisTile.currentColumn === emptySlot.column) {
          // Add the slot that holds thisTile to the array of moveable slots.
          slots.push(thisTile.currentSlot);
          // How many slots hold tiles between thisTile and emptySlot, including thisTile.
          numSlots = Math.abs((emptySlot.row - thisTile.currentRow));
          // Determine delta based on emptySlot being farther up or down.
          delta = emptySlot.row - thisTile.currentRow > 0 ? 1 : -1;
          // Add additional moveable tile's slots that are also in this column.
          for (i = 1; i < numSlots; i += 1) {
              slots.push(getSlotByPosition(thisTile.currentRow + delta * i, thisTile.currentColumn));
          }
          // Set the direction for movement between columns.
          direction.y = delta;
      } else {
          // This tile is not moveable, return undefined.
          return undefined;
      }
      
      info.slots = slots;
      info.direction = direction;
      return info;
  }
  
  
  // Updates a slot's tile information to match the slot.
  function gainSlotTile(pSlot) {
      pSlot.tile.currentSlot = pSlot;
      pSlot.tile.currentColumn = pSlot.column;
      pSlot.tile.currentRow = pSlot.row;
  }
  
  // Moves the tile in pFirst to pSecond, does not save the tile of pSecond.
  function swapWithEmpty(pSlot) {
      var tempTile,
          tempSlot;

      tempTile = pSlot.tile;
      pSlot.tile = emptySlot.tile;
      emptySlot.tile = tempTile;
      
      tempSlot = pSlot;
      pSlot = emptySlot;
      emptySlot = tempSlot;
      
      pSlot.element.appendChild(pSlot.tile.element);
      gainSlotTile(pSlot);
  }

  // Moves the tiles.
  function moveTile(pMovableInfo) {
      var i;          // Loop variable.
      
      for (i = pMovableInfo.slots.length - 1; i >= 0; i -= 1) {
          swapWithEmpty(pMovableInfo.slots[i]);
      }
  }
  
  // Called when a tile element is clicked on.
  function onTileClick() {
      var clickedTile,        // The object that holds the tile element that was clicked on.
          movableInfo;        // An object that holds an array of movable tile's slots and a direction object.
      
      // Find the tile object related to the tile element that was clicked on.
      clickedTile = getCurrentTile(this);
      // Get movable information.
      movableInfo = getTilesCanMove(clickedTile);
      // If there are moveable tiles, move them.
      if (typeof movableInfo !== "undefined") {
          moveTile(movableInfo);
      }
      didWin();
  }

  // Tiles that can move should have a red border
  function hoverRed() {
      var movableInfo,
          hoveredTile,
          i;
      
      // Get the tile properties from the one that was hovered over
      hoveredTile = getCurrentTile(this);
      // Get an array of movable tiles
      movableInfo = getTilesCanMove(hoveredTile);

      // If it's movable make the border red
      if (typeof movableInfo !== "undefined") {
          // Save the slots that are to be hovered so they can be unhihighlighted.
          hoveredSlots = movableInfo.slots;
          // Make the border red for each slot.
          for (i = 0; i < hoveredSlots.length; i += 1) {
              hoveredSlots[i].tile.element.style.borderColor = "red";
              document.body.style.cursor = "pointer";
          }
      }
  }

  // Make the border black again
  // Could only target the ones that were movable but this works for now
  function hoverRedExit() {
      var i;
      // Revert the style back to their original.
      for (i = 0; i < hoveredSlots.length; i += 1) {
          hoveredSlots[i].tile.element.style.borderColor = "black";
          document.body.style.cursor = "default";
      }
      
  }

  // Update the pixel location of the slot passed in.
  function gainSlotPosition(pSlot) {
      pSlot.element.style.top = (pSlot.y).toString() + "px";
      pSlot.element.style.left = (pSlot.x).toString() + "px";
  }
  
  // Create slots for the board.
  function createSlot(rowIndex, colIndex) {
      var slot = {},
          i;
      
      slot.element = document.createElement("div");
      slot.element.setAttribute("class", "slot");
      // Index is always equal to the position within allSlots array.
      slot.index = board.allSlots.length;
      // Remember the row and column index for this slot.
      slot.row = rowIndex;
      slot.column = colIndex;
      // Set the position of this slot based on its column and row indices.
      slot.x = (colIndex % colSlots) * tileLength;
      slot.y = (rowIndex % rowSlots) * tileLength;
      // Update the position of this slot within the parent.
      gainSlotPosition(slot);
      return slot;
  }
  
  // Sets the background image position for the element passed in given the indexes.
  function setSlotImage(thisTile, cIndex, rIndex) {
      var backgroundX = ((cIndex % colSlots) * -tileLength).toString() + "px",
          backgroundY = ((rIndex % rowSlots) * -tileLength).toString() + "px";
      thisTile.element.style.backgroundPosition = backgroundX + " " + backgroundY;
  }
  
  // Insert a textNode representing the tile number into the tile.
  function createTileDisplay(thisTile) {
      // Make the node.
      var node = document.createElement("p");
      node.innerHTML = thisTile.displayText;
      // Add the appropriate class.
      node.setAttribute("class", "tileNumber");
      // Append it to the tile.
      thisTile.element.appendChild(node);
  }
  
  // Creates and returns a tile object.
  function createTile(rowIndex, colIndex) {
      var tile = {};      // The tile object that will be returned.
      
      tile.element = document.createElement("div");
      tile.element.setAttribute("class", "tile");
      // The correct slot for this tile starts at this tile's count.
      tile.correctSlot = board.allSlots[board.allTiles.length];
      // Initially, the tile is in the correct slot.
      tile.currentSlot = board.allSlots[board.allTiles.length];
      // Index starts at 0, value starts at 1.
      tile.displayText = (board.allTiles.length + 1).toString();
      // Set the current row and column index for this tile.
      tile.currentRow = rowIndex;
      tile.currentColumn = colIndex;
      // Set the background position for this tile.
      setSlotImage(tile, colIndex, rowIndex);
      // Render the tile's displayText value.
      createTileDisplay(tile);
      
      // Add the tile on click listener.
      tile.element.onclick = onTileClick;
      tile.element.onmouseup = hoverRedExit;
      // Add hovering listener
      tile.element.onmouseenter = hoverRed;
      tile.element.onmouseleave = hoverRedExit;

      return tile;
  }
  
  // Manages the creation of the slots.
  function startSlot() {
      var slot,       // The slot object being created.
          i,          // Loop variable.
          j;          // Loop variable.

      // Create the slots
      for (i = 0; i < colSlots; i += 1) {
          for (j = 0; j < rowSlots; j += 1) {
              slot = createSlot(i, j);
              puzzleArea.appendChild(slot.element);
              board.allSlots.push(slot);
          }
      }
      // The last slot is always the empty slot to start.
      emptySlot = board.allSlots[tileCount];
  }
  
  // Manages the creation of tiles, requires slots to be initialized first.
  function startTile() {
      var tile,       // The tile object.
          i,          // Loop variables.
          j;
      
      for (i = 0; i < rowSlots; i += 1) {
          for (j = 0; j < colSlots; j += 1) {
              tile = createTile(i, j);
              board.allSlots[board.allTiles.length].tile = tile;
              board.allSlots[board.allTiles.length].element.appendChild(tile.element);
              board.allTiles.push(tile);
              // Check if we have created all the tiles.
              if (board.allTiles.length === tileCount) {
                  return;
              }
          }
      }
  }
  
  // Gets the slots adjacent to the slot passed in.
  function gainPossibleSlots(pSlot) {
      var possibleMoves = [];
      
      // Get the slot above pSlot, if there is one.
      if (pSlot.row > 0) {
          possibleMoves.push(getSlotByPosition(pSlot.row - 1, pSlot.column));
      }
      // Get the slot below pSlot, if there is one.
      if (pSlot.row < rowSlots - 1) {
          possibleMoves.push(getSlotByPosition(pSlot.row + 1, pSlot.column));
      }
      // Get the slot to the left of pSlot, if there is one.
      if (pSlot.column > 0) {
          possibleMoves.push(getSlotByPosition(pSlot.row, pSlot.column - 1));
      }
      // Get the slot to the right of pSlot, if there is one.
      if (pSlot.column < colSlots - 1) {
          possibleMoves.push(getSlotByPosition(pSlot.row, pSlot.column + 1));
      }
      
      return possibleMoves;
  }
  
  // If game is won, tell the user
  function didWin(){
      var correctBoards=0;   //keep track of correct boards
      // console.log(board.allSlots[15]);

      // Go through board and check to make sure pieces are in the correct slot
      // If the empty slot is where it's supposed to win, check the rest of the board
      if(board.allSlots[15].tile === undefined){
          // Check to see if the rest of the board is correct
          for (var i = 0; i < board.allSlots.length - 1; i += 1) {
              // If it's in the correct spot the add to correctBoards
              if(board.allSlots[i].element.innerText == i+1){
                  correctBoards += 1;
                  console.log(board.allSlots[i].element.innerText + " " + i);
              }
          }
          // If all slots are correct then player wins!
          if(correctBoards == 15){
              window.alert("You win!");    
          }
      }
      correctBoards = 0;
  }
  
  // Sets up the shuffle button for game play.
  function shuffle() {
      var swapIterations = 1000,      // How many times to move the emptySlot.
          possibleMoveslots,              // An array of eligible slots to swap with the empty slot.
          slotToSwap,                 // A randomly chosen slot from possibleMoveslots.
          i;                          // Loop variable.
      
      // The onclick listener for the shuffle button.
      shuffleButton.onclick = function () {
          for (i = 0; i < swapIterations; i += 1) {
              // Find adjacent slots.
              possibleMoveslots = gainPossibleSlots(emptySlot);
              // console.log(possibleMoveslots);
              // Choose one at random.
              slotToSwap = possibleMoveslots[Math.floor(Math.random() * possibleMoveslots.length)];
              swapWithEmpty(slotToSwap);
          }
      };
  }    
  
  
  /* PUBLIC FUNCTIONS */
  
  // Creates the game board.
  board.init = function (boardId, shuffleId) {
      // Initialize the global variables.
      puzzleArea = document.getElementById(boardId);
      shuffleButton = document.getElementById(shuffleId);
      // Initialize the slots.
      startSlot();
      // Initialize the tiles.
      startTile();
      // Initialize the shuffle items.
      shuffle();
  };

  return board;
}());

// Initialize the game board when the window has finished loading.
(function () {
  "use strict";
  
  window.onload = function () {
      addButtons();
      var boardId = "puzzlearea",         // The element ID of the board div.
          shuffleId = "shufflebutton";    // The shuffle button of the game board.
      
      // Create the game board.
	  getImage();
      puzzleBoard.init(boardId, shuffleId);
  };

}
());
function getImage() {
  let randomInt = Math.floor(Math.random() * 100);
  
  document.body.style.backgroundImage = "url('https://source.unsplash.com/random?sig="+randomInt+"')";
}