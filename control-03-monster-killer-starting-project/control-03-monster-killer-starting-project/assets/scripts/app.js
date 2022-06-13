
/* to make user enter the health value */
const enteredPlayerValue= parseInt( prompt('please enter the player health value '));
/* this variable to holds the entered value */
let choosenHealthValue= enteredPlayerValue;

/* to force adjust out of range enterde value from 0 to 100 */
/* isNaN builtin function to check if it NaN value */
/* isNaN yeilds a true if the value was NaN */
if( isNaN(enteredPlayerValue) || enteredPlayerValue<=0 || enteredPlayerValue>100){
    choosenHealthValue=100; // force adjust the entered number to 100
}


let normalAttack=1;
let extremAttack=20;
let playerDamageValue=12;

let currentMonsterHealth=choosenHealthValue;
let currentPlayerHealth=choosenHealthValue;

let monsterDamage;
let playerDamage;

let anotherPlayerHealth=100;
let resetValue=100;
let tries=1;
let logEnteryContent=[];


const STRONG_ATTACk="STRONG_ATTACK";
const NORMAL_ATTACK="NORMAL_ATTACK";
const PLAYER_HEAL="PLAYER_HEAL";




/* to set the healthbar values */
adjustHealthBars(choosenHealthValue);

/* any attack function */
function attackAnyMode(attackValue){
    /* Both are alive */
    if((currentMonsterHealth >0) && ( currentPlayerHealth  >0)) {
        monsterDamage=dealMonsterDamage(attackValue);
        playerDamage=dealPlayerDamage(playerDamageValue);
        currentPlayerHealth-= playerDamage;
        currentMonsterHealth-= monsterDamage;
        /* monster died */
    }else if(( currentMonsterHealth <=0) && (currentPlayerHealth > 0)){
        alert('you are won!');
        reset();
         /* record player_win event */
        logEnteryContent.push("reset_flag::player win");
        /* player died */
    }else if ((( currentMonsterHealth >0) && (currentPlayerHealth <= 0))){
        alert('sorry you lose');
        reset();
        /* record monster_win event */
        logEnteryContent.push("reset_flag::monster win");
}else if (currentMonsterHealth <=0 && currentPlayerHealth <= 0){
    alert('the game was draw!!!')
    reset();
    /* record the draw event */
    logEnteryContent.push("reset_flag::nobody win");
}
}
/* reset the game */
 function reset(){
    choosenHealthValue=100;
    adjustHealthBars(choosenHealthValue);
     currentMonsterHealth=choosenHealthValue;
     currentPlayerHealth=choosenHealthValue;
     resetGame(resetValue) ;
 }

/* normal attack function */
function attackHandeler(){
    attackAnyMode(normalAttack);
    writeEventLog(NORMAL_ATTACK,"player",monsterDamage,currentMonsterHealth,currentPlayerHealth);
    }

/* strong attack function */
function strongAttack(){
    attackAnyMode(extremAttack);
    writeEventLog(STRONG_ATTACk,"player",monsterDamage,currentMonsterHealth,currentPlayerHealth);
}
/* player another chance */
function anotherTry(){
    if(tries!==0){
    increasePlayerHealth(); // adjust healthbar to maximum
    currentPlayerHealth=choosenHealthValue; // adjust the current player health to maximum
    tries --;   
    removeBonusLife();
    }else{
        alert('no tries available');
    }
}
/* write the events */
 function writeEventLog(ev,tar,val1,monsHeal1,playHeal1){
    let logEnteryDetails={
        event: ev,
        target:tar,
        damageValue:val1,
        monsterHealth:monsHeal1,
        playerHealth:playHeal1,
    };
    logEnteryContent.push(logEnteryDetails);
 }
 
/* display game log */
 function eventLog(){
    console.log(logEnteryContent);
 }

 

attackBtn.addEventListener('click', attackHandeler);
strongAttackBtn.addEventListener('click', strongAttack);
healBtn.addEventListener('click', anotherTry );
logBtn.addEventListener('click',eventLog);