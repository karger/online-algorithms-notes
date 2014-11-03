Lecture = {answers:[]};

Lecture.init = function() {

    var 
    buttons = $('<span class="buttons"/>')
        .append('<input class="answer-button" value="submit answer" type="button">'),
    
    already = $('<input class="already-button" value="already answered" type="button">')

    makeAnswerBox = function(node, label) {
        var answerBox = $('<div class="answer-box"></div>');

        answerBox.append('<textarea rows=3 cols=70 class="answer-input">');
        buttons.clone().appendTo(answerBox);
        answerBox.data('answer',node);
        return answerBox;
    }
    
    , processAnswerButton = function() {
        var node = $(this).parents('.answer-box')
        , correct = $(node).data('answer')
        , theirs = $('.answer-input',node).val();

        if (!theirs) {
            alert("please write something first! If you don't know, just put a question mark.");
            return;
        } else {
            Lecture.answers.push({question: $(correct).text(),
                                  answer: theirs});
            showAnswer(node, theirs);
        }
    }
    
    , processAlreadyButton = function() {
        var node = $(this).parents('.answer-box');
        $('.answer-input',node).val("See above.");
        processAnswerButton.call(this);
    }

    , showAnswer = function (nodeArg, theirs) {
        var node = $(nodeArg || this)
        , answer = $(node.data('answer'));
        $('<div/>').text(theirs).addClass("theirs").prependTo(answer);
        $('<div/>').addClass("clear").appendTo(answer);
        answer.find(".buttons").append(already);
        node.replaceWith(answer);
        if (answer.hasClass('unwrap')) {
            answer.children().unwrap();
        }
    }
    
    , saveAll = function() {
        var i, table = $('<table>'), tr, td, html, name, uri
        , surveyDone = true
        , survey=$("#survey");
        
        survey.find('select').each(function () {
            if ($(this).val() === "0") {
                alert("please fill out the survey questions");
                surveyDone=false;
                return false;
            }
            return true;
        });
        if (!surveyDone) {
            return;
        }
        
        name = $('.name').val();
        if (!name) {
            alert('please enter name');
            return;
        }
        for (i=0; i<Lecture.answers.length;i++) {
            tr=$('<tr>');
            $('<td/>').append(Lecture.answers[i].question)
                .appendTo(tr);
            $('<td/>').append(Lecture.answers[i].answer)
                .appendTo(tr);
            tr.appendTo(table);
        }
        survey.find('select').each(function() {
            tr = $('<tr>');
            $('<td/>').append("survey")
                .appendTo(tr);
            $('<td/>').append($(this).val())
                .appendTo(tr);
            tr.appendTo(table);
        });

        html = '<html><head></head><body><table>'
            +table.html()
            +'</table></body></html>'
            .replace(/(<\/[a-z]*>)/g,'$1\n')  // 'prett print'
        uri = "data:application/octet-stream;charset=utf-8,"
            + encodeURIComponent('<html>'+html+'</html>');
        window.open(uri,"_blank");
    }

    , hints = $('.hint')
    , answers = $('.answer');

    answers.replaceWith(function () {
        return makeAnswerBox(this,"Respond");
    });
    hints.replaceWith(function () {
        return $('<input class="show-button" type="button" value="Hint">').data('answer',this);
    });
    $('body').on('click','.show-button',function () {showAnswer(this);});
    $('body').on('click','.answer-button',processAnswerButton);
    $('body').on('click','.already-button',processAlreadyButton);
    
    $('body').append('<div>Name: <input class="name" type="textfield"></input></div>');
    $('body').append('<input type="button" value="Save" class="save"></input>');

    $('body').on('click','.save',function () {
        saveAll();
    });

}

$(document).ready(function () {
//    Lecture.init();
    MathJax.Hub.Register.StartupHook("End",Lecture.init);
});