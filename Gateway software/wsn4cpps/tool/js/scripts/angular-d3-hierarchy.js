angular.module('angular-d3-hierarchy', [])
.directive('d3Hierarchy', function() {
	return {
		scope: {
			d3Hierarchy: '=',
			width: '=?',
			height: '=?',
			depth: '=?'
		},
		restrict: 'AE',
		controller: function($scope, $element) {
			$scope.refresh = function() {
				$scope.chart =
					$scope.svg.chart("tree.radial")
					//.diameter(500)
					.radius(function(d) { if( d.size ) { return Math.log(d.size) } else { return 5 }; })
					.zoomable([0.1, 3])
					.collapsible($scope.depth || 1)
					//.duration(200)
					//.sortable("_ASC") 
					;

				$scope.chart.draw($scope.d3Hierarchy);
			};

			$scope.$watch('d3Hierarchy', $scope.refresh);
		},
		link: function($scope, $element) {
			$element.addClass('d3Hierarchy');
			$scope.svg = d3.select($element[0]).append("svg")
				.attr('width', $scope.width || 800)
				.attr('height', $scope.height || 800);
		}
	}
});
