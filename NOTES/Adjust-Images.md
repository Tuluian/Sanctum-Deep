For each enemy, you can adjust:

  Size - Change width and height:
  .enemy-figure[data-enemy-type="ghoul"] {
    width: 180px;   /* wider */
    height: 240px;  /* taller */
  }

  Vertical position - Use background-position to shift the image up/down:
  .enemy-figure[data-enemy-type="ghoul"] {
    background-position: center bottom;  /* default - anchored to bottom */
    background-position: center top;     /* anchored to top */
    background-position: center 20px;    /* 20px from top */
    background-position: center -20px;   /* raised 20px above container */
  }

  Or use margin/transform to move the whole element:
  .enemy-figure[data-enemy-type="ghoul"] {
    margin-top: -30px;           /* raise the whole figure up */
    transform: translateY(-30px); /* alternative way to raise it */
  }

  The CSS rules are in 
  src/styles/main.css 
  around lines 436-507. Each enemy has its own block you can tweak independently.