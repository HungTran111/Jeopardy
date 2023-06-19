// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

let categories = [];
let categoryIds = [];
let numCateg = 30;
const $startBtn = $('#start-btn');
const $gameBoard = $('#game-board');


/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */
async function getCategoryIds() {
    const response = await axios.get(`https://jservice.io/api/categories?count=${numCateg}`)
    console.log(response.data)
    // get a set of categories(30)

    const categClue = response.data.filter(c => c.clues_count > 6)
    console.log('categ clues', categClue)
    // filter all categories with 6 clues higher

    while (categoryIds.length < 6) {
        let randomNum = Math.floor(Math.random() * categClue.length);
        if (!(categoryIds.includes(categClue[randomNum].id))){
            categoryIds.push(categClue[randomNum].id);
        }
        //gen 6 random categoryIds from filtered categClue
    }
    return categoryIds;
}





/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
    const response = await axios.get(`https://jservice.io/api/category?id=${catId}`);
    console.log(response.data)
    const {clues} = response.data;
    console.log({clues})
    const cluesArray = [];

    for (let clue of clues) {
        const {question, answer} = clue;
        const obj = {question, answer, show:null};
        cluesArray.push(obj);
    }
    //loop clues and set clues into an obj to cluesArray then pick 5 random(questions and clues)

    let fiveCluesArray = _.sampleSize(cluesArray, 5);

    return {title: response.data.title, clues: fiveCluesArray};
}








/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {
    const $wholeTable = $('<table></table>');
    const $tableHead = $(`
        <thead>
            <tr>
                <th id='0'>${categories[0].title}</th>
                <th id='1'>${categories[1].title}</th>
                <th id='2'>${categories[2].title}</th>
                <th id='3'>${categories[3].title}</th>
                <th id='4'>${categories[4].title}</th>
                <th id='5'>${categories[5].title}</th>
            </tr>
        </thead>`);
        // <thead> filled with <tr> for name of categories
    

    const $tableBody = $('<tbody></tbody>');
    $wholeTable.append($tableHead);
    $wholeTable.append($tableBody);
    // append tableHead and tableBody into wholeTable

    for (let c = 0; c < 5; c++) {
        //loop 0-5 and set each <tr>
        const $tr = $(`<tr id = ${c}></tr>`);
        for (let t = 0; t < 6; t++) {
            //loop each <tr> and set 3 <p> (?, question, answer)
            const $tableData = $(`
            <td id="${t}-${c}">
                <p class="questionMark">?</p>
                <p class="clue">${categories[t].clues[c].question}</p>
                <p class="answer">${categories[t].clues[c].answer}</p>
            </td>
            `);
            $tr.append($tableData);
        }
        $tableBody.append($tr);
    }
    $gameBoard.append($wholeTable);
    //append <tr> to <tbody> to <table>
    $(".clue").hide();
    $(".answer").hide();
    //hide question and answer and show '?'

}







/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
    const id = $(this).attr('id');
    console.log(id)
    const t = Number(id.split('')[0]);
    console.log(t)
    const c = Number(id.split('')[2]);
    console.log(c)


    if(!categories[t].clues[c].show){
        //if show property is null, show clue and change the show property to question
        $(this).children('.questionMark').hide();
        $(this).children('.clue').show();
        $(this).children('.answer').hide();
        $(this).css('background-color', 'orange');
        
        categories[t].clues[c].show = 'question';
        //set showed clue as 'question'

    } else if (categories[t].clues[c].show === 'question'){
        //if show property is set to question, show answer
        $(this).children('.questionMark').hide();
        $(this).children('.clue').hide();
        $(this).children('.answer').show();
        $(this).css('background-color', 'green');

    } else {
        return;
    }
}





/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
    $gameBoard.hide();
    $startBtn.text('LOADING...');
}




/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
    $startBtn.text('RESTART');
}





/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
    showLoadingView();
    categories = [];
    categoryIds = [];
    $gameBoard.empty();

    await getCategoryIds();
    for (let id of categoryIds){
        const obj = await getCategory(id);
        categories.push(obj);
        console.log(categories)
    }

    fillTable()
    hideLoadingView();
    $gameBoard.show();
}

/** On click of start / restart button, set up game. */
$startBtn.on('click', setupAndStart);
// TODO

/** On page load, add event handler for clicking clues */
$('body').on('click', 'td', handleClick);
// TODO