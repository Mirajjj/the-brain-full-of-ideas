/*
 * Created by Herman Leus
 * https://github.com/Mirajjj/the-brain-full-of-ideas

 * Dependencies:
 * JQuery
 * Paper.js
 */

window.brain = function (canvas, filesFolderPath, events){
            var self = this,
                _loadedItems = [],
                _mainCenterItem,
                _brainBG,
                _images = {},
                internal =  {};

            paper.setup(canvas)

            paper.view.onFrame = function (event) {
                self.onFrame(event);
            };

            self.getItems = function () {
                return _loadedItems;
            };

            self.onFrame = function () {};

            self.init = function () {
                var updateFunc,
                    hoverFunc,
                    staticStateFunc,
                    resizeFunc,
                    svg = paper.project.importSVG(_loadedItems[0]),
                    tool = new paper.Tool(),
                    isBrainHover = false,
                    didOnce = false,
                    hoverRect,
                    externalTrigger = false;

                _images['mask0'].visible = true;
                _brainBG = internal.attachCompoundPath(svg, _images['mask0']);
                _mainCenterItem = new paper.Group([paper.project.importSVG(_loadedItems[0]), paper.project.importSVG(_loadedItems[1])]);

                _mainCenterItem.name = 'loaderCenterItem';
                _mainCenterItem.scale(0.4);
                _mainCenterItem.position.x = paper.view.size.width / 2;
                _mainCenterItem.position.y = paper.view.size.height / 2;
                _mainCenterItem.children[0].visible = false;

                _brainBG.scale(0.39);
                _brainBG.position.x = paper.view.size.width / 2;
                _brainBG.position.y = paper.view.size.height / 2;

                hoverRect = internal.drawRectHover();
                hoverRect.visible = false;
                hoverRect.active = false;

                updateFunc = self.getUpdateFunctions().center;
                hoverFunc =  self.getUpdateFunctions().changeImages;
                staticStateFunc = self.getUpdateFunctions().staticState;
                resizeFunc = self.getUpdateFunctions().resize;

                self.onFrame = function (event) {
                    updateFunc(event, 1, 3);

                    if (isBrainHover) {
                        hoverFunc(event);

                        if (!hoverRect.active) {
                            hoverRect.active = true;
                            hoverRect.visible = true;

                            internal.setCursor.pointer();
                        }

                        if(events && events.onHover && didOnce) {
                            events.onHover();
                        }

                        didOnce = false;
                    } else if (!didOnce) {
                        staticStateFunc();

                        if (hoverRect.active) {
                            hoverRect.active = false;
                            hoverRect.visible = false;

                            internal.setCursor.normal();
                        }

                        if(events && events.onHoverOut) {
                            events.onHoverOut();
                        }

                        didOnce = true;
                    }
                };

                tool.onMouseMove = function (event) {
                    if (!externalTrigger) {
                        if (_brainBG.contains(event.point)) {
                            isBrainHover = true;
                        } else {
                            isBrainHover = false;
                        }
                    }
                };

                $(window).resize(function () {
                    resizeFunc();
                    hoverRect.resize();

                });


                $(canvas).on('brainMouseOver', function () {
                    externalTrigger = true;
                    isBrainHover = true;
                });

                $(canvas).on('brainMouseOut', function () {
                    externalTrigger = false;
                    isBrainHover = false;
                });

            };

            internal.setFiles = function (func) {
                $.when($.get(filesFolderPath + '/brainBackground.svg'),
                        $.get(filesFolderPath + '/brain.svg'),
                        $.get(filesFolderPath + '/ideaLamp.svg')
                ).done(function (p1, p2, p3) {
                    for (var index in arguments) {
                       _loadedItems.push(arguments[index][0]);
                    }
  
                    internal.setImages();
                    func();
                });
            };

            internal.setImage = function (key, src) {
                var raster = new paper.Raster({
                    source: src,
                    position: new paper.Point(paper.view.center.x, paper.view.center.y)
                });

                raster.visible = false;

                _images[key] = raster;

                return raster;
            };

            internal.setImages = function () {
                internal.setImage('mask0', filesFolderPath + '/mask1.jpg');
                internal.setImage('mask1', filesFolderPath + '/mask2.jpg');
                internal.setImage('mask2', filesFolderPath + '/mask3.jpg');
                internal.setImage('mask3', filesFolderPath + '/mask4.jpg');
                internal.setImage('mask4', filesFolderPath + '/mask5.jpg');

                internal.setImage('bg', filesFolderPath + '/texture_6.png');
            };

            internal.attachCompoundPath = function (path, raster) {
                var compoundPath,
                    group;

                path.position.x = paper.view.size.width / 2 - (path.bounds.width / 2) * 0.2;
                path.position.y = paper.view.size.height / 2 - (path.bounds.height / 2) * 0.2;

                compoundPath = new paper.CompoundPath(path);

                group = new paper.Group([compoundPath, raster]);
                //group.clipMask = true;
                group.clipped = true;

                path.setNewGroup = function (img) {
                    //group.remove();
                    group.removeChildren();
                    group.addChild(compoundPath);
                    group.addChild(img);
                    //group.clipMask = true;
                    group.clipped = true;
                };

                return path;//_compoundPathGroups.push(group);
            };

            internal.actions = {};
            internal.actions.brain = {};
            internal.actions.brain.currentPlay = 0;
            internal.actions.brain.scenario = [
                function () {
                    //Normal Enlarging
                    _mainCenterItem.scale(internal.actions.brain.config.scaleInc);
                    _brainBG.scale(internal.actions.brain.config.scaleInc);

                    if (_mainCenterItem.bounds.width  >= internal.actions.brain.config.breakPointWidth) {
                        internal.actions.brain.config.timeElapsed  = 0;
                        internal.actions.brain.currentPlay++;
                    }
                },
                function (flyingItemFunc) {
                    //Quick Enlarging
                    _mainCenterItem.scale(internal.actions.brain.config.scaleIncX2);
                    _brainBG.scale(internal.actions.brain.config.scaleIncX2);

                    if (_mainCenterItem.bounds.width  >= internal.actions.brain.config.maxWidth) {
                        internal.actions.brain.config.timeElapsed  = 0;
                        internal.actions.brain.currentPlay++;

                        flyingItemFunc.push(internal.moveItemByVector(internal.generatePath(), internal.createItem(2)));
                    }
                },
                function () {
                    //Quick Size Decrease

                    _mainCenterItem.scale(internal.actions.brain.config.scaleDecX2);
                    _brainBG.scale(internal.actions.brain.config.scaleDecX2);

                    if (_mainCenterItem.bounds.width  <= internal.actions.brain.config.breakPointWidth) {
                        internal.actions.brain.config.timeElapsed  = 0;
                        internal.actions.brain.currentPlay++;
                    }
                },
                function () {
                    //Normal Size Decrease
                    _mainCenterItem.scale(internal.actions.brain.config.scaleDec);
                    _brainBG.scale(internal.actions.brain.config.scaleDec);

                    if (_mainCenterItem.bounds.width  <= internal.actions.brain.config.minWidth) {
                        internal.actions.brain.config.timeElapsed  = 0;
                        internal.actions.brain.currentPlay = 0;
                    }
                },
                function () {

                }
            ];

            self.getUpdateFunctions = function () {
                var flyingItemFunc = [],
                    timeElapsed = 0,
                    imageIndex = 0,
                    speed = 1;
                internal.actions.brain.config = {
                    timeElapsed: 0,
                    scaleInc: 1.005,
                    scaleIncX2: 1.02,
                    scaleDec: 0.995,
                    scaleDecX2: 0.98,
                    minWidth: _mainCenterItem.bounds.width,
                    breakPointWidth: _mainCenterItem.bounds.width * 1.3,
                    maxWidth: _mainCenterItem.bounds.width * 1.5
                };

                return {
                    'center': function (event, period, speed) {
                        var i;

                        internal.actions.brain.scenario[internal.actions.brain.currentPlay](flyingItemFunc);
                        internal.actions.brain.config.timeElapsed  += event.delta;

                        if (flyingItemFunc.length > 0) {
                            for (i = 0; i < flyingItemFunc.length; i++) {
                                if (flyingItemFunc[i]) {
                                    flyingItemFunc[i](event);
                                } else {
                                    flyingItemFunc.splice(i, 1);
                                    // console.log(flyingItemFunc);
                                }
                            }
                        }
                    },
                    changeImages: function (event) {
                        var masks = 5;

                        timeElapsed += event.delta;

                        if (timeElapsed > 0.1) {
                            timeElapsed = 0;

                            if (imageIndex >= masks) {
                                _images['mask' + (imageIndex - 1)].visible = false;
                                imageIndex = 0;
                            } else if (imageIndex !== 0) {
                                _images['mask' + (imageIndex - 1)].visible = false;
                            }

                            _images['mask' + imageIndex].visible = true;
                            _brainBG.setNewGroup(_images['mask' + imageIndex]);

                            imageIndex++;
                        }
                    },
                    staticState: function () {
                        _images['bg'].visible = true;
                        _brainBG.setNewGroup(_images['bg']);
                    },
                    resize: function () {
                        var key;

                        _mainCenterItem.position.x = paper.view.size.width / 2 - (_mainCenterItem.bounds.width / 2) * 0.2;
                        _mainCenterItem.position.y = paper.view.size.height / 2 - (_mainCenterItem.bounds.height / 2) * 0.2;

                        _brainBG.position.x = paper.view.size.width / 2 - (_brainBG.bounds.width / 2) * 0.2;
                        _brainBG.position.y = paper.view.size.height / 2 - (_brainBG.bounds.height / 2) * 0.2;

                        for (key in _images) {
                            _images[key].position =  new paper.Point(paper.view.center.x, paper.view.center.y);
                        }
                    }
                };
            };

            internal.createItem = function (index) {
                var createdItem = paper.project.importSVG(_loadedItems[index]),
                    group = internal.groupWithBackground(createdItem);

                group.sendToBack();

                group.scale(0.5);
                group.position.x = paper.view.size.width / 2 - (createdItem.bounds.width / 2) * 0.3;
                group.position.y = paper.view.size.height / 2 - (createdItem.bounds.height / 2) * 0.3;

                return group;
            };

            internal.operators = {};

            internal.operators.addition = function (points) {
                var i,
                    finalPoint = new paper.Point(0, 0);

                for (i = 0; i !== points.length; i++) {
                    finalPoint.x += points[i].x;
                    finalPoint.y += points[i].y;
                }

                return finalPoint;
            };

            internal.trigonometry = {};

            internal.trigonometry.getAngle = function (startPoint, endPoint, debug) {
                var distance =  startPoint.getDistance(endPoint),
                    nearSide = Math.abs(startPoint.y - endPoint.y).toFixed(2),
                    radians,
                    degrees,
                    quarter;

                if ((startPoint.x <= endPoint.x) && (startPoint.y <= endPoint.y)) {
                    quarter = 1;
                    degrees = 0;
                } else if ((startPoint.x >= endPoint.x) && (startPoint.y <= endPoint.y)) {
                    quarter = 2;
                    degrees = 180;
                } else if ((startPoint.x >= endPoint.x) && (startPoint.y >= endPoint.y)) {
                    quarter = 3;
                    degrees = 180;
                } else if ((startPoint.x <= endPoint.x) && (startPoint.y >= endPoint.y)) {
                    quarter = 4;
                    degrees = 360;
                }

                radians = parseFloat(Math.asin((nearSide / distance).toFixed(2)));

                if (quarter === 4 || quarter === 2) {
                    degrees -=  parseFloat((radians * (180 / Math.PI)).toFixed(2));
                } else {
                    degrees += parseFloat((radians * (180 / Math.PI)).toFixed(2));
                }

                if (debug) {
                    console.log('Degrees: ' + degrees);
                    console.log('Quarter: ' + quarter);
                }

                return degrees; //following watches arrow
            };

            internal.moveItemByVector = function (path, item) {
                var distance = path.first.getDistance(path.last),
                    angle = internal.trigonometry.getAngle(path.first, path.last),
                    steps = 200,
                    step = distance / steps,
                    currentStep = 0,
                    currentDistance = 0,
                    rotationValue = 2,
                    vector = new paper.Point({length: 0, angle: angle}),
                    lastPoint = internal.operators.addition([path.first, vector]),
                    tempPath = new paper.Path(),
                    blinking = internal.getBlinkingEventFunc(item.children[0]);

                item.position.x =  path.first.x;
                item.position.y =  path.first.y;

                tempPath.add(path.first, lastPoint);
                //tempPath.strokeColor = 'black';
                tempPath.closed = true;

                return function (event) {
                    if (currentStep <= steps) {
                        tempPath.segments[1].point =  internal.operators.addition([path.first, new paper.Point({length: currentDistance, angle: angle})]);


                        item.rotate(rotationValue);
                        item.position.x =  tempPath.segments[1].point.x;
                        item.position.y =  tempPath.segments[1].point.y;

                        currentStep++;
                        currentDistance += step;

                        if (blinking && blinking(event)) { // Stop invocation of this function as it has no need anymore
                            blinking = false;
                        }

                    } else {
                        item.remove();
                        tempPath.remove();
                        path.path.remove();
                        this[0] = null;
                        return;
                    }

                };
            };

            internal.generatePath = function () {
                var point1 = [paper.view.size.width / 2, paper.view.size.height / 2],
                    point2,// = [paper.view.size.width, paper.view.size.height],
                    path = new paper.Path();

                if (internal.getRandomInt(0, 1) === 1) {
                    point2 = [paper.view.size.width * 1.1, internal.getRandomInt(0, paper.view.size.height)];
                } else {
                    point2 = [internal.getRandomInt(0, paper.view.size.width), paper.view.size.height * 1.1];
                }

                path.add(new paper.Point(point1), new paper.Point(point2));
                //path.strokeColor = 'black';
                path.closed = true;

                return {
                    first: new paper.Point(point1),
                    last: new paper.Point(point2),
                    path: path
                };
            };

            internal.getRandomInt = function (min, max) {
                return Math.floor(Math.random() * (max - min + 1)) + min;
            };

            internal.groupWithBackground = function (item) {
                var group,
                    path = new paper.Path.Circle({
                        center: [item.position.x, item.position.y + 20],
                        radius: (item.bounds.width > item.bounds.height ? item.bounds.width : item.bounds.height) * 1.5
                    }),
                    position = new paper.Point(path.position);

                path.position.y -= path.bounds.width / 13;

                group = new paper.Group(path, item);

                return group;
            };

            internal.getBlinkingEventFunc = function (item) {
                var delta = 0,
                    timePassed = 0,
                    timeLimit = 1,
                    visibility = false;

                return function (event) {
                    var visible =  {
                            gradient: {
                                stops: [[new paper.Color(255, 216, 81, 0.8), 0.1], [new paper.Color(1, 1, 0, 0.0), 1]],
                                radial: true
                            },
                            origin: new paper.Point(item.position.x, item.position.y),
                            destination: item.bounds.topCenter
                        },
                        invisible = new paper.Color(1, 1, 0, 0.0);

                    delta += event.delta;
                    timePassed += event.delta;


                    if (timePassed > timeLimit && delta > 0.05) {
                        delta = 0;

                        if (visibility) {
                            item.fillColor = invisible;
                            visibility = false;
                        } else {
                            item.fillColor = visible;
                            visibility = true;
                        }
                    }

                    if (timePassed > timeLimit + 1) {
                        item.fillColor = visible;

                        return true; // Means that you can remove invocation of this function
                    }

                    return false;// Means that you ought not to remove invocation of this function
                };
            };

            internal.drawRectHover = function () {
                var size = new paper.Size(_brainBG.bounds.width * 2.5, _brainBG.bounds.height * 1.8),
                    strokedRect = new paper.Path.Rectangle({
                        point: [_brainBG.position.x - size.width / 2, _brainBG.position.y - size.height / 2],
                        size: [size.width, size.height]
                    }),
                    filledRect,
                    text = new paper.PointText(new paper.Point(strokedRect.bounds.topCenter)),
                    group,
                    offsetY = 7;

                text.fontFamily = 'Source Sans Pro';
                text.content = 'I got more!';
                text.fontWeight = '700';
                text.fontSize = '25px';
                text.fillColor = '#fff';
                text.position.x -= text.bounds.width / 2;
                text.position.y -= offsetY;

                size = new paper.Size(text.bounds.width * 1.5, text.bounds.height);

                filledRect = new paper.Path.Rectangle({
                    point: [text.position.x - size.width / 2, text.position.y - size.height / 2],
                    size: [size.width, size.height]
                });
                filledRect.fillColor = '#CF000F';


                strokedRect.strokeColor = '#CF000F';
                strokedRect.strokeWidth = 3;

                group = new paper.Group([strokedRect, filledRect, text]);

                group.delta = {};
                group.delta.x = _brainBG.position.x - group.position.x;
                group.delta.y = _brainBG.position.y - group.position.y;

                group.resize = function () {
                    group.position.x = _brainBG.position.x - group.delta.x;
                    group.position.y = _brainBG.position.y - group.delta.y;
                }

                return group;
            };

            internal.setCursor  = {};

            internal.setCursor.pointer = function () {
                $(canvas).css('cursor', 'pointer');
            };

            internal.setCursor.normal = function () {
                $(canvas).css('cursor', 'default');
            };

            internal.setFiles(self.init);
        };
