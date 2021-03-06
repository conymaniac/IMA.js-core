describe('Core.Abstract.PageRender', function() {

	var pageRender = null;
	var $Helper = ns.Vendor.$Helper;
	var React = oc.get('$React');
	var settings = oc.get('$Settings');

	beforeEach(function() {
		pageRender = oc.create('Core.Abstract.PageRender', [$Helper, React, settings]);
	});

	it('should be throw error for mounting component', function() {
		expect(function() {
			pageRender.mount();
		}).toThrow();
	});

	describe('setState method', function() {

		it('should be set new state to reactive component view', function() {
			var state = {state: 'state'};
			var reactiveComponentView = {
				setState: function() {}
			};
			pageRender._reactiveView = reactiveComponentView;
			spyOn(reactiveComponentView, 'setState')
				.and
				.stub();

			pageRender.setState(state);

			expect(reactiveComponentView.setState).toHaveBeenCalledWith(state);
		});

	});

	/*it('should be wrap each key to promise', function() {
		var param1 = 'param1'
		var dataMap = {
			param1: param1,
			param2: Promise.resolve('param2')
		};

		spyOn(Promise, 'resolve')
			.and
			.callThrough();

		pageRender._wrapEachKeyToPromise(dataMap);

		expect(Promise.resolve).toHaveBeenCalledWith(param1);
		expect(Promise.resolve.calls.count()).toEqual(1);
	});*/

});