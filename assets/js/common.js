$(document).ready(function () {
  // add toggle functionality to abstract, award and bibtex buttons
  $("a.abstract").click(function () {
    $(this).parent().parent().find(".abstract.hidden").toggleClass("open");
    $(this).parent().parent().find(".award.hidden.open").toggleClass("open");
    $(this).parent().parent().find(".bibtex.hidden.open").toggleClass("open");
  });
  $("a.award").click(function () {
    $(this).parent().parent().find(".abstract.hidden.open").toggleClass("open");
    $(this).parent().parent().find(".award.hidden").toggleClass("open");
    $(this).parent().parent().find(".bibtex.hidden.open").toggleClass("open");
  });
  $("a.bibtex").click(function () {
    $(this).parent().parent().find(".abstract.hidden.open").toggleClass("open");
    $(this).parent().parent().find(".award.hidden.open").toggleClass("open");
    $(this).parent().parent().find(".bibtex.hidden").toggleClass("open");
  });
  $("a").removeClass("waves-effect waves-light");

  // bootstrap-toc
  if ($("#toc-sidebar").length) {
    // remove related publications years from the TOC
    $(".publications h2").each(function () {
      $(this).attr("data-toc-skip", "");
    });
    var navSelector = "#toc-sidebar";
    var $myNav = $(navSelector);
    Toc.init($myNav);
    $("body").scrollspy({
      target: navSelector,
    });
  }

  // add css to jupyter notebooks
  const cssLink = document.createElement("link");
  cssLink.href = "../css/jupyter.css";
  cssLink.rel = "stylesheet";
  cssLink.type = "text/css";

  let jupyterTheme = determineComputedTheme();

  $(".jupyter-notebook-iframe-container iframe").each(function () {
    $(this).contents().find("head").append(cssLink);

    if (jupyterTheme == "dark") {
      $(this).bind("load", function () {
        $(this).contents().find("body").attr({
          "data-jp-theme-light": "false",
          "data-jp-theme-name": "JupyterLab Dark",
        });
      });
    }
  });

  // trigger popovers
  $('[data-toggle="popover"]').popover({
    trigger: "hover",
  });
});

// HTML-preserving typewriter animation for coauthor expansion
function typeMoreAuthors(el, speed) {
  var $btn = $(el);
  var $list = $btn.siblings('.more-authors-list');
  $btn.hide();

  var fullHtml = $list.data('full-html');
  if (!fullHtml) {
    fullHtml = $list.html();
    $list.data('full-html', fullHtml);
  }

  var container = $list[0];
  container.innerHTML = '';
  $list.show();

  var temp = document.createElement('span');
  temp.innerHTML = fullHtml;

  var tasks = [];
  function extractTasks(sourceNode, targetNode) {
    for (var i = 0; i < sourceNode.childNodes.length; i++) {
      var node = sourceNode.childNodes[i];
      if (node.nodeType === Node.TEXT_NODE) {
        var text = node.textContent;
        for (var j = 0; j < text.length; j++) {
          tasks.push({ type: 'char', char: text[j], target: targetNode });
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        var clone = node.cloneNode(false);
        // Bind onclick if needed
        if (node.classList && node.classList.contains('less-authors')) {
          clone.onclick = function() { hideMoreAuthors(this); };
        }
        tasks.push({ type: 'elem', elem: clone, target: targetNode });
        extractTasks(node, clone);
      }
    }
  }
  extractTasks(temp, container);

  var idx = 0;
  var interval = setInterval(function () {
    if (idx >= tasks.length) {
      clearInterval(interval);
      return;
    }
    var task = tasks[idx++];
    if (task.type === 'elem') {
      task.target.appendChild(task.elem);
    } else if (task.type === 'char') {
      task.target.appendChild(document.createTextNode(task.char));
    }
  }, speed || 12);
}

function hideMoreAuthors(el) {
  var $less = $(el);
  var $list = $less.closest('.more-authors-list');
  $list.hide();
  $list.siblings('.more-authors').fadeIn(150);
}

