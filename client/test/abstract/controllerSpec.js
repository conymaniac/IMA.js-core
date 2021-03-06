describe('Core.Abstract.Controller', function() {

	var controller = null;
	var pageStateManager = null;

	beforeEach(function() {
		controller = oc.create('Core.Abstract.Controller');
		pageStateManager = oc.create('Core.Interface.PageStateManager');

		controller.setStateManager(pageStateManager);
	});

	it('shoudl be throw error for load method', function() {
		expect(function() {
			controller.load();
		}).toThrow();
	});

	it('should be set new state to PageStateManager', function() {
		var state = {state: 'state'};

		spyOn(pageStateManager, 'setState')
			.and
			.stub();

		controller.setState(state);

		expect(pageStateManager.setState).toHaveBeenCalledWith(state);
	});

	it('should be patch state to PageStateManager', function() {
		var state = {state: 'state'};

		spyOn(pageStateManager, 'patchState')
			.and
			.stub();

		controller.patchState(state);

		expect(pageStateManager.patchState).toHaveBeenCalledWith(state);
	});

	describe('getState method', function() {

		it('should be get state from PageStateManager for setted stateManager', function() {
			spyOn(pageStateManager, 'getState')
				.and
				.stub();

			controller.getState();

			expect(pageStateManager.getState).toHaveBeenCalled();
		});

		it('should be return null for undefined stateManager', function() {
			controller.setStateManager(null);

			expect(controller.getState()).toEqual(null);
		});
	});
});