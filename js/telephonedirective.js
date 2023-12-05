app.directive('telephone', function() {
    return {
        restrict: 'A',
        scope: {
            data: '=',
            clickCallback: '&',
            selectedItem: '=',
            ngMode: '='
        },
        templateUrl: 'telephone.html',
        link: function (scope, element, attrs) {
            scope.optValue = attrs.optValue;
            scope.optDescription = attrs.optDescription;
            scope.optFilter = attrs.optFilter;
        }
    };
});