var SSA = require('../lib/ssa/ssa-engine'),
    _ = require('underscore');


describe("ssa recommendation engine", function() {

    var sim = function (x, y) { return Math.abs(x - y);},

        ssa = new SSA(_);


    describe("find k nearest neighbors", function() {

        /**
         * Usual euclidian distance can be thought of as a "similarity" measure.
         * The farther away a number is to another number, the "closer" they are in this similarity
         * measure. So if we give #findKNearestNeighbors input:
         *
         * target = 0,
         * tag list = [0, 1, 2, 3, ..., 10]
         * sim = Math.abs
         * k = 3
         *
         * Then it will return the 3-top-most numbers
         *
         */
        it("should work", function () {

            var args = {
                    k: 3,
                    sim: sim,
                    target: 0,
                    categories: _.range(11)
                },

                actual = ssa.findKNearestNeighbors(args);

            expect(actual).toEqual([10, 9, 8]);

        });
    });

    describe("SSAp", function() {

        /**
         * Given
         * target = 0,
         * threshold = 0,
         * nearest neighbors = [9]
         * sim = euclidian distance
         * neighbors = [8, 9,10]
         * and SSA that describes this hierarchy:
         *   (8)->(9)->(10)
         *
         * Then
         * SSAp(target,8) = SSA(8,9) = 1 / 9 * 9 = 1;
         * SSAp(target,9) = SSA(9,9) = 1
         * SSAp(target,10) = SSA(10,9) = 0
         */
        it("should work", function() {

            var args = {
                    target: 0,
                    parameters: {threshold: 0},
                    nearestneighbors: [9],
                    categories: [8,9,10],
                    sim: sim,
                    SSA: function(x,y) {

                        var matrix = {
                                "8->9": 1,
                                "8->10": 1 / 2,
                                "9->10": 1
                            },

                            index = x + "->" + y;

                        if (x === y) return 1;

                        return matrix[index] ? matrix[index] : 0;
                    }
                },

                actual = ssa.SSAp(args),
                actualSSA = _.pluck(actual, 'ssa'),
                actualVals = _.pluck(actual, 'value');


            expect(actualSSA).toEqual([1,1,0]);
            expect(actualVals).toEqual([8,9,10]);
        });


        /**
         * Given
         * target = 0,
         * threshold = 0,
         * nearest neighbors = [9]
         * sim = euclidian distance
         * neighbors = [7,8,9,10]
         * and SSA that describes this hierarchy:
         *   (8)->(9)->(10)
         *   (7)->(10)
         *
         * Then
         * SSAp(target,7) = SSA(7,9) = 0
         * SSAp(target,8) = SSA(8,9) = 1 / 9 * 9 = 1;
         * SSAp(target,9) = SSA(9,9) = 1
         * SSAp(target,10) = SSA(10,9) = 0
         */
        it("should work 2", function() {

            var args = {
                    target: 0,
                    parameters: {threshold: 0},
                    nearestneighbors: [9],
                    categories: [7, 8, 9, 10],
                    sim: sim,
                    SSA: function (x, y) {
    
                        var matrix = {
                                "8->9": 1,
                                "8->10": 1 / 2,
                                "9->10": 1,
                                "7->10": 1
                            },
    
                            index = x + "->" + y;
    
                        if (x === y) return 1;
    
                        return matrix[index] ? matrix[index] : 0;
                    }
                },

                actual = ssa.SSAp(args),
                actualSSA = _.pluck(actual, 'ssa'),
                actualVals = _.pluck(actual, 'value');


            expect(actualSSA).toEqual([0,1,1,0]);
            expect(actualVals).toEqual([7,8,9,10]);
        });


        /**
         * Given
         * target = 0,
         * threshold = 0,
         * nearest neighbors = [7,9]
         * sim = euclidian distance
         * neighbors = [7,8,9,10]
         * and SSA that describes this hierarchy:
         *   (8)->(9)->(10)
         *   (7)->(10)
         *
         * Then
         * denom = 7+9 = 16
         * SSAp(target,7) = [SSA(7,7)*sim + SSA(7,9)*sim] / 16  = [1*7 + 0] / 16 = 7/16
         * SSAp(target,8) = [SSA(8,7)*7 + SSA(8,9)*9] / 16 = [0 + 9] / 16 = 9/16
         * SSAp(target,9) = [SSA(9,7]*7 + SSA(9,9)*9] / 16 = [0 + 9] / 16 = 9/16
         * SSAp(target,10) = [SSA(10,7)*7 + SSA(10,9)*9] / 16 = 0
         */
        it("should work 3", function() {

            var args = {
                    target: 0,
                    parameters: {threshold: 0},
                    nearestneighbors: [7, 9],
                    categories: [7, 8, 9, 10],
                    sim: sim,
                    SSA: function (x, y) {

                        var matrix = {
                                "8->9": 1,
                                "8->10": 1 / 2,
                                "9->10": 1,
                                "7->10": 1
                            },

                            index = x + "->" + y;

                        if (x === y) return 1;

                        return matrix[index] ? matrix[index] : 0;
                    }
                },

                actual = ssa.SSAp(args),
                actualSSA = _.pluck(actual, 'ssa'),
                actualVals = _.pluck(actual, 'value');


            expect(actualSSA).toEqual([7/16,9/16,9/16,0]);
            expect(actualVals).toEqual([7,8,9,10]);
        });
    });
});