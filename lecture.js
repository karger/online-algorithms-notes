Lecture = {answers:[]};

Lecture.init = function() {

    // [Cloudstitch] Changed these to SUBMIT buttons so CS can catch them.
    var 
    buttons = $('<span class="buttons"/>')
        .append('<input class="answer-button" value="submit answer" type="submit">'),
    
    already = $('<input class="already-button" value="already answered" type="submit">')

    makeAnswerBox = function(node, ansNum, label) {
        // [Cloudstitch] Modified HTML generation below to include some hidden fields
        var questionBox = $('<div class="question-box"></div>');
        node = $(node);
        node.wrap(questionBox);

        var answerForm = $('<form class="answer-box" connect="questions!rows"></form>');
        answerForm.append('<input class="studentName" type="hidden" connect="questions!col(name)" value="unknown" />');
        answerForm.append('<input type="hidden" connect="questions!col(question)" value="' + ansNum + '" />');
        answerForm.append('<textarea connect="questions!col(answer)" rows=3 cols=70 class="answer-input"></textarea>');
        buttons.clone().appendTo(answerForm);
        node.before(answerForm);

        var klass = 'followup-' + ansNum;
        node.addClass(klass);
        answerForm.attr('data-klass', klass);
        node.css('display', 'none');

        // answerForm.data('answer',node);
        // answerForm.appendTo(questionBox);

        // debugger;
        // var followupDiv = $(node);
        // followupDiv.addClass(klass);
        // followupDiv.css('display', 'none');        
        // answerForm.data('followup-class', klass);
        // followupDiv.appendTo(questionBox);

        return questionBox;
    }
    
    , processAnswerButton = function() {
        var node = $(this).parents('.answer-box')
        , correct = $(node).data('answer')
        , theirs = $('.answer-input',node).val();

        var myName = $('.myName').val().trim();

        if (!theirs) {
            alert("please write something first! If you don't know, just put a question mark.");
            return;
        } else if (myName.length == 0) {
            alert("please enter your name at the top of the page first!");
            return;            
        } else {
            var studentName = $()
            $('.studentName').val(myName);
            // [Cloudstitch] This will push the row to the spreadsheet.
            // We use trigger('submit') instead of .submit() because we want to
            // give cloudstitch the opportunity to catch and cancel submission.
            // $(node).trigger('submit'); 
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

        // Show the answer
        $('.' + node.attr('data-klass')).css('display', 'block');
        node.css('display', 'none');

        $('<div/>').text(theirs).addClass("theirs").prependTo(answer);
        $('<div/>').addClass("clear").appendTo(answer);
        answer.find(".buttons").append(already);
        node.after(answer);
        if (answer.hasClass('unwrap')) {
            answer.children().unwrap();
        }
    }, wireUpSurvey = function() {
        var survey = $('#survey');
        survey.append('<input class="studentName" type="hidden" connect="survey!col(name)" value="unknown" />');
        var surveyForm = $('<form connect="survey!rows"></form>');
        survey.wrap(surveyForm);
        $.each(survey.find('select'), function(idx, elem) {
            var elem = $(elem);
            var id = elem.attr('id');
            elem.attr('connect', 'col(' + id + ')');
        });
        survey.append('<input type="submit" value="Record survey answers">');
    },
    
    saveAll = function() {
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

    answers.each(function (idx, elem) {
        return makeAnswerBox(elem,idx,"Respond");
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

    // [Cloudstitch] Finally we'll manually add the Cloudstitch libraries after
    // building out the HTML.
    // ---------------------------------------------------------------------
    wireUpSurvey();

    var mathjax = document.createElement( 'script' );
    mathjax.type = 'text/javascript';
    mathjax.src = 'http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML';
    document.head.appendChild( mathjax );

    var spreadsheet = document.createElement( 'link' );
    spreadsheet.type = 'cloudstitch/gsheet';
    spreadsheet.setAttribute('href', window.datasource);
    document.head.appendChild( spreadsheet );

    var cloudstitch = document.createElement( 'script' );
    cloudstitch.setAttribute('app', window.appkey);
    cloudstitch.type = 'text/javascript';
    cloudstitch.src = window.library;
    document.head.appendChild( cloudstitch );
}

$(document).ready(function () {
    Lecture.init();
    // MathJax.Hub.Register.StartupHook("End",Lecture.init);
});