/**
 * @ngdoc directive
 * @name angular-cardview:cardView
 * @author Steven Sojka - 2013
 * @description
 * 
 * This script is an angular component built for Matteo Spinelli's [http://cubiq.org/cardview](CardView) script.
 * 
 * @param {Expression} template The template to compile for each card.
 * @param {Array} dataset An array of card data.
 * @param {String="slide"} [effect] Animation effect to use.
 * @param {Expression} [on-content-update] Function to call when content needs updating.
 * @param {*} [reverse] Reverses the direction of the card deck.
 * @param {String="horizontal"} [direction] Direction for the animation and swiping.
 * @param {*} [indicators] Whether to show indicators.
 * @param {*} [override] Bypasses the default onUpdateContent. This will keep templates from getting compiled. Use to write yout own custom behavior instead of whats provided.
 * @param {Expression} [on-create] An expression to handle when the cardview is instantizted. Available through `$cardview`
 * 
 */
angular.module("angular-cardview", []).directive("cardView", ["$injector", function($injector) {
  return {
    restrict: "EA",
    scope: {
      dataset: "=",
      template: "&",
      onUpdateContentWrapper: "&onUpdateContent",
      onCreate: "&"
    },
    template: [
      "<div class='card-view'>",
        "<div class='deck'>",
          "<div class='card'></div>",
          "<div class='card'></div>",
          "<div class='card'></div>",
        "</div>",
      "</div>",
      "<div ng-show='indicators && dataset.length > 1' class='indicator-container'>",
        "<div class='indicator' ng-class='{active: index == $index}' ng-repeat='card in dataset'></div>",
      "</div>"
    ].join(""),
    link: function(scope, element, attrs) {
      var $compile = $injector.get("$compile");
      var $timeout = $injector.get("$timeout");
      var $templateCache = $injector.get("$templateCache");
      var template = $templateCache.get(scope.template()).trim();
      var reverse = "reverse" in attrs;
      var override = "override" in attrs;
      var effect = attrs.effect || "slide";
      var direction = attrs.direction === "vertical" ? "v" : "h";
      var onUpdateContentWrapper = function(el, data) {
        scope.onUpdateContentWrapper({el: el, data: data});
      };
      
      scope.indicators = "indicators" in attrs;
      
      if (reverse) {
        /**
         * This will reverse order in case you want the slider to go the opposite direction.
         * This will sort the original array!
         */
        var first = scope.dataset.shift();
        scope.dataset.reverse();
        scope.dataset.unshift(first);
      }
      
      function onDataAdd(val, oldVal) {
        if (val === oldVal) {
          return;
        }

        cardView.pageCount = val.length;
        cardView.goToPage(cardView.page);
      }
      
      scope.$watch("dataset", onDataAdd, true);
      
      var onUpdateContent = override ? onUpdateContentWrapper : function(el, data) {
        
        // Data for the template is all namespaced under "card"
        var childScope = angular.extend(scope.$parent.$new(), {card: data});
        
        var compTemp = $compile(template)(childScope);
        
        compTemp.bind("$destroy", function() { // Destroy the scope when this card isn't used anymore
          childScope.$destroy();
        });
        
        angular.element(el).html("").append(compTemp);
        
        scope.index = reverse 
          ? cardView.page !== 0 ? cardView.pageCount - cardView.page : 0
          : cardView.page;

        onUpdateContentWrapper.call(this, el, data);          

      };
      
      var cardView = new CardView(element.children()[0], {
        direction: direction,
        effect: effect,
        dataset: scope.dataset,
        onUpdateContent: function(el, data) {
          $timeout(angular.bind(this, function() { // Force async to avoid duplicate digest cycles
            scope.$apply(angular.bind(this, function() {
              onUpdateContent.call(this, el, data);
            }));
          }));
        }
      });

      scope.onCreate({$cardview: cardView});
    }
    
  }
}]);