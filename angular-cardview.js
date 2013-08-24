/**
 * This script is an angular component built for Matteo Spinelli's [http://cubiq.org/cardview](CardView) script.
 * 
 * @author Steven Sojka
 */
angular.module("angular-cardview", []).directive("cardView", ["$injector", function($injector) {
  return {
    restrict: "EA",
    scope: {
      data: "="
    },
    template: [
      "<div class='wrapper'>",
        "<div class='card'></div>",
        "<div class='card'></div>",
        "<div class='card'></div>", // Use correct template
      "</div>",
      "<div ng-show='indicators' class='indicator-container'>",
        "<div class='indicator' ng-repeat='card in data'></div>",
      "</div>"
    ].join(""),
    link: function(scope, element, attrs) {
      var $compile = $injector.get("$compile");
      var $timeout = $injector.get("$timeout");
      var $parse = $injector.get("$parse");
      var $templateCache = $injector.get("$templateCache");
      
      var template = $templateCache.get(attrs.template).trim();
      var reverse = "reverse" in attrs;
      var onUpdateContentWrapper = "onUpdateContent" in attrs ? $parse(attrs.onUpdateContent)(scope) : null;
      var override = "override" in attrs;
      var effect = attrs.effect || "slide";
      var indicators = "indicators" in attrs;
      var direction = attrs.direction === "vertical" ? "v" : "h";
      
      if (reverse) {
        /**
         * This will reverse order in case you want the slider to go the opposite direction
         */
        var first = data.shift();
        data.reverse();
        data.unshift(first);
      }
      
      function onDataAdd(val, oldVal) {
        if (val === oldVal) {
          return;
        }
        
        /**
         * Perform our logic for adding cards
         */
      }
      
      scope.$watch("data.length", onDataAdd);
      
      var onUpdateContent = override ? onUpdateContentWrapper : function(el, data) {
        
        // Data for the template is all namespaced under "card"
        var compTemp = $compile(template)(angular.extend(scope.$new(), {card: data}));
        
        //Existing scopes get destroyed when the html is replaced
        angular.element(el).html("").append(compTemp);
        
        scope.index = reverse 
          ? cardView.page !== 0 ? cardView.pageCount - cardView.page : 0
          : cardView.page; // Check to see if this is right
        
        if (onUpdateContentWrapper) {
          onUpdateContentWrapper.call(this, el, data);          
        }
      };
      
      var cardView = new CardView(element[0], {
        direction: direction,
        effect: effect,
        dataset: scope.data,
        onUpdateContent: function(el, data) {
          var self = this;
          $timeout(function() { // Force async to avoid duplicate digest cycles
            scope.$apply(function() {
              onUpdateContent.call(self, el, data);
            });
          });
        }
      });
    }
    
  }
}]);