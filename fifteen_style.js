function addButtons() {
  "use strict";

  var buttonsArr = [],i,linkAttribute,imgAttribute;

  var buttonDiv = document.createElement("DIV");
  
  for(i=0; i<3;i++){
      buttonsArr[i] = document.createElement("A");
      imgAttribute = document.createElement("IMG");

      imgAttribute.className = "validations";
      if(0 === i%3){
          imgAttribute.setAttribute("src", "./valid-html.png");
          buttonsArr[i].href = "https://validator.w3.org/nu";
          imgAttribute.setAttribute("alt", "html validation");
      }else if(1 === i%3){
          imgAttribute.setAttribute("src", "./valid-css.png");
          buttonsArr[i].href = "https://jigsaw.w3.org/css-validator";
          imgAttribute.setAttribute("alt", "css validation");
      }  
      buttonsArr[i].appendChild(imgAttribute);
      buttonDiv.appendChild(buttonsArr[i]);
  }
  document.body.appendChild(buttonDiv);
}

var puzzleBoard = (function () {
  "use strict";
  
  var board = {},                 
      rowSlots = 4,               
      colSlots = 4,               
      tileLength = 100,           
      tileCount,                  
      emptySlot,                  
      shuffleButton,              
      checkIfGameWon = false,
      hoveredSlots = {},               
      puzzleArea;                 
      tileCount = colSlots * rowSlots - 1;
      board.allTiles = [];            
      board.allSlots = [];            
   
  function getCurrentTile(tileElement) {
      var i;      
      
      for (i = 0; i < board.allTiles.length; i += 1) {
          if (board.allTiles[i].element === tileElement) {
              return board.allTiles[i];
          }
      }
      return undefined;
  }
  
  function getSlotByPosition(pRow, pColumn) {
      return board.allSlots[pRow * colSlots + pColumn];
  }
  
  function getTilesCanMove(thisTile) {
      var info = {},      
          slots = [],     
          direction = {}, 
          numSlots,       
          delta,          
          i;              
          direction.x = 0;
          direction.y = 0;
      
      if (thisTile.currentRow === emptySlot.row) {
          slots.push(thisTile.currentSlot);
          numSlots = Math.abs((emptySlot.column - thisTile.currentColumn));
          delta = emptySlot.column - thisTile.currentColumn > 0 ? 1 : -1;
          for (i = 1; i < numSlots; i += 1) {
              slots.push(getSlotByPosition(thisTile.currentRow, thisTile.currentColumn + delta * i));
          }
          direction.x = delta;
      } else if (thisTile.currentColumn === emptySlot.column) {
          slots.push(thisTile.currentSlot);
          numSlots = Math.abs((emptySlot.row - thisTile.currentRow));
          delta = emptySlot.row - thisTile.currentRow > 0 ? 1 : -1;
          for (i = 1; i < numSlots; i += 1) {
              slots.push(getSlotByPosition(thisTile.currentRow + delta * i, thisTile.currentColumn));
          }
          direction.y = delta;
      } else {
          return undefined;
      }
      
      info.slots = slots;
      info.direction = direction;
      return info;
  }
  
  
  function gainSlotTile(pSlot) {
      pSlot.tile.currentSlot = pSlot;
      pSlot.tile.currentColumn = pSlot.column;
      pSlot.tile.currentRow = pSlot.row;
  }
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
  function moveTile(pMovableInfo) {
      var i;          
      for (i = pMovableInfo.slots.length - 1; i >= 0; i -= 1) {
          swapWithEmpty(pMovableInfo.slots[i]);
      }
  }  
  function onTileClick() {
      var clickedTile,        
          movableInfo;        
      clickedTile = getCurrentTile(this);
      movableInfo = getTilesCanMove(clickedTile);
      if (typeof movableInfo !== "undefined") {
          moveTile(movableInfo);
      }
      didWin();
  }
  function hoverRed() {
      var movableInfo,
          hoveredTile,
          i;
      hoveredTile = getCurrentTile(this);
      movableInfo = getTilesCanMove(hoveredTile);
      if (typeof movableInfo !== "undefined") {
          hoveredSlots = movableInfo.slots;
          for (i = 0; i < hoveredSlots.length; i += 1) {
              hoveredSlots[i].tile.element.style.borderColor = "red";
              document.body.style.cursor = "pointer";
          }
      }
  }
  function hoverRedExit() {
      var i;
      for (i = 0; i < hoveredSlots.length; i += 1) {
          hoveredSlots[i].tile.element.style.borderColor = "black";
          document.body.style.cursor = "default";
      }
      
  }
  function gainSlotPosition(pSlot) {
      pSlot.element.style.top = (pSlot.y).toString() + "px";
      pSlot.element.style.left = (pSlot.x).toString() + "px";
  }
  function createSlot(rowIndex, colIndex) {
      var slot = {},
      i;
      slot.element = document.createElement("div");
      slot.element.setAttribute("class", "slot");
      slot.index = board.allSlots.length;
      slot.row = rowIndex;
      slot.column = colIndex;
      slot.x = (colIndex % colSlots) * tileLength;
      slot.y = (rowIndex % rowSlots) * tileLength;
      gainSlotPosition(slot);
      return slot;
  }
  function setSlotImage(thisTile, cIndex, rIndex) {
      var backgroundX = ((cIndex % colSlots) * -tileLength).toString() + "px",
          backgroundY = ((rIndex % rowSlots) * -tileLength).toString() + "px";
      thisTile.element.style.backgroundPosition = backgroundX + " " + backgroundY;
  }
  function createTileDisplay(thisTile) {
      var node = document.createElement("p");
      node.innerHTML = thisTile.displayText;
      node.setAttribute("class", "tileNumber");
      thisTile.element.appendChild(node);
  }
  
  function createTile(rowIndex, colIndex) {
      var tile = {};      
      tile.element = document.createElement("div");
      tile.element.setAttribute("class", "tile");
      tile.correctSlot = board.allSlots[board.allTiles.length];
      tile.currentSlot = board.allSlots[board.allTiles.length];
      tile.displayText = (board.allTiles.length + 1).toString();
      tile.currentRow = rowIndex;
      tile.currentColumn = colIndex;
      setSlotImage(tile, colIndex, rowIndex);
      createTileDisplay(tile);
      tile.element.onclick = onTileClick;
      tile.element.onmouseup = hoverRedExit;
      tile.element.onmouseenter = hoverRed;
      tile.element.onmouseleave = hoverRedExit;
      return tile;
  }
  
  function startSlot() {
      var slot,       
          i,          
          j;          
      for (i = 0; i < colSlots; i += 1) {
          for (j = 0; j < rowSlots; j += 1) {
              slot = createSlot(i, j);
              puzzleArea.appendChild(slot.element);
              board.allSlots.push(slot);
          }
      }
      emptySlot = board.allSlots[tileCount];
  }
  function startTile() {
      var tile,       
          i,          
          j;
      
      for (i = 0; i < rowSlots; i += 1) {
          for (j = 0; j < colSlots; j += 1) {
              tile = createTile(i, j);
              board.allSlots[board.allTiles.length].tile = tile;
              board.allSlots[board.allTiles.length].element.appendChild(tile.element);
              board.allTiles.push(tile);
              if (board.allTiles.length === tileCount) {
                  return;
              }
          }
      }
  }
    function gainPossibleSlots(pSlot) {
      var possibleMoves = [];
      if (pSlot.row > 0) {
          possibleMoves.push(getSlotByPosition(pSlot.row - 1, pSlot.column));
      }
      if (pSlot.row < rowSlots - 1) {
          possibleMoves.push(getSlotByPosition(pSlot.row + 1, pSlot.column));
      }
      if (pSlot.column > 0) {
          possibleMoves.push(getSlotByPosition(pSlot.row, pSlot.column - 1));
      }
      if (pSlot.column < colSlots - 1) {
          possibleMoves.push(getSlotByPosition(pSlot.row, pSlot.column + 1));
      }
      return possibleMoves;
  }
  
  function didWin(){
      var correctBoards=0;
      if(board.allSlots[15].tile === undefined){
          for (var i = 0; i < board.allSlots.length - 1; i += 1) {
              if(board.allSlots[i].element.innerText == i+1){
                  correctBoards += 1;
                  console.log(board.allSlots[i].element.innerText + " " + i);
              }
          }
          if(correctBoards == 15){
              window.alert("You win!");
              confetti();    
          }
      }
      correctBoards = 0;
  }
  function shuffle() {
      var swapIterations = 1000,      
          possibleMoveslots,              
          slotToSwap,                 
          i;                          
      shuffleButton.onclick = function () {
          for (i = 0; i < swapIterations; i += 1) {
              possibleMoveslots = gainPossibleSlots(emptySlot);
              slotToSwap = possibleMoveslots[Math.floor(Math.random() * possibleMoveslots.length)];
              swapWithEmpty(slotToSwap);
          }
      };
  }    
  board.init = function (boardId, shuffleId) {
      puzzleArea = document.getElementById(boardId);
      shuffleButton = document.getElementById(shuffleId);
      startSlot();
      startTile();
      shuffle();
  };

  return board;
}());

(function () {
  "use strict";
  
  window.onload = function () {
      addButtons();
      var boardId = "puzzlearea",         
      shuffleId = "shufflebutton";    
      getImage();
      puzzleBoard.init(boardId, shuffleId);
  };

}
());
function getImage() {
  let randomInt = Math.floor(Math.random() * 100);
  
  document.body.style.backgroundImage = "url('https://source.unsplash.com/random?sig="+randomInt+"')";
}
function confetti(){
    let canvas = document.getElementById('confetti');
    
    var zindex=1;

	canvas.width = 400;
	canvas.height = 400;
	canvas.style.zIndex=zindex;
    
    let ctx = canvas.getContext('2d');
    let pieces = [];
    let numberOfPieces = 50;
    let lastUpdateTime = Date.now();
    
    function randomColor () {
        let colors = ['#f00', '#0f0', '#00f', '#0ff', '#f0f', '#ff0'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    function update () {
        let now = Date.now(),
            dt = now - lastUpdateTime;
    
        for (let i = pieces.length - 1; i >= 0; i--) {
            let p = pieces[i];
    
            if (p.y > canvas.height) {
                pieces.splice(i, 1);
                continue;
            }
    
            p.y += p.gravity * dt;
            p.rotation += p.rotationSpeed * dt;
        }
    
    
        while (pieces.length < numberOfPieces) {
            pieces.push(new Piece(Math.random() * canvas.width, -20));
        }
    
        lastUpdateTime = now;
    
        setTimeout(update, 1);
    }
    
    function draw () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    
        pieces.forEach(function (p) {
            ctx.save();
    
            ctx.fillStyle = p.color;
    
            ctx.translate(p.x + p.size / 2, p.y + p.size / 2);
            ctx.rotate(p.rotation);
    
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
    
            ctx.restore();
        });
    
        requestAnimationFrame(draw);
    }
    
    function Piece (x, y) {
        this.x = x;
        this.y = y;
        this.size = (Math.random() * 0.5 + 0.75) * 15;
        this.gravity = (Math.random() * 0.5 + 0.75) * 0.1;
        this.rotation = (Math.PI * 2) * Math.random();
        this.rotationSpeed = (Math.PI * 2) * (Math.random() - 0.5) * 0.001;
        this.color = randomColor();
    }
    
    while (pieces.length < numberOfPieces) {
        pieces.push(new Piece(Math.random() * canvas.width, Math.random() * canvas.height));
    }
    
    update();
    draw();
    }