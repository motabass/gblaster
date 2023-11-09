'use strict';

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }
function _construct(Parent, args, Class) { if (_isNativeReflectConstruct()) { _construct = Reflect.construct.bind(); } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _isNativeFunction(fn) { try { return Function.toString.call(fn).indexOf("[native code]") !== -1; } catch (e) { return typeof fn === "function"; } }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
customElements.define('compodoc-menu', /*#__PURE__*/function (_HTMLElement) {
  _inherits(_class, _HTMLElement);
  var _super = _createSuper(_class);
  function _class() {
    var _this;
    _classCallCheck(this, _class);
    _this = _super.call(this);
    _this.isNormalMode = _this.getAttribute('mode') === 'normal';
    return _this;
  }
  _createClass(_class, [{
    key: "connectedCallback",
    value: function connectedCallback() {
      this.render(this.isNormalMode);
    }
  }, {
    key: "render",
    value: function render(isNormalMode) {
      var tp = lithtml.html("\n        <nav>\n            <ul class=\"list\">\n                <li class=\"title\">\n                    <a href=\"index.html\" data-type=\"index-link\">gblaster</a>\n                </li>\n\n                <li class=\"divider\"></li>\n                ".concat(isNormalMode ? "<div id=\"book-search-input\" role=\"search\"><input type=\"text\" placeholder=\"Type to search\"></div>" : '', "\n                <li class=\"chapter\">\n                    <a data-type=\"chapter-link\" href=\"index.html\"><span class=\"icon ion-ios-home\"></span>Getting started</a>\n                    <ul class=\"links\">\n                        <li class=\"link\">\n                            <a href=\"overview.html\" data-type=\"chapter-link\">\n                                <span class=\"icon ion-ios-keypad\"></span>Overview\n                            </a>\n                        </li>\n                        <li class=\"link\">\n                            <a href=\"index.html\" data-type=\"chapter-link\">\n                                <span class=\"icon ion-ios-paper\"></span>README\n                            </a>\n                        </li>\n                        <li class=\"link\">\n                            <a href=\"changelog.html\"  data-type=\"chapter-link\">\n                                <span class=\"icon ion-ios-paper\"></span>CHANGELOG\n                            </a>\n                        </li>\n                        <li class=\"link\">\n                            <a href=\"license.html\"  data-type=\"chapter-link\">\n                                <span class=\"icon ion-ios-paper\"></span>LICENSE\n                            </a>\n                        </li>\n                        <li class=\"link\">\n                            <a href=\"todo.html\"  data-type=\"chapter-link\">\n                                <span class=\"icon ion-ios-paper\"></span>TODO\n                            </a>\n                        </li>\n                                <li class=\"link\">\n                                    <a href=\"dependencies.html\" data-type=\"chapter-link\">\n                                        <span class=\"icon ion-ios-list\"></span>Dependencies\n                                    </a>\n                                </li>\n                                <li class=\"link\">\n                                    <a href=\"properties.html\" data-type=\"chapter-link\">\n                                        <span class=\"icon ion-ios-apps\"></span>Properties\n                                    </a>\n                                </li>\n                    </ul>\n                </li>\n                    <li class=\"chapter additional\">\n                        <div class=\"simple menu-toggler\" data-bs-toggle=\"collapse\" ").concat(isNormalMode ? 'data-bs-target="#additional-pages"' : 'data-bs-target="#xs-additional-pages"', ">\n                            <span class=\"icon ion-ios-book\"></span>\n                            <span>Projects</span>\n                            <span class=\"icon ion-ios-arrow-down\"></span>\n                        </div>\n                        <ul class=\"links collapse \" ").concat(isNormalMode ? 'id="additional-pages"' : 'id="xs-additional-pages"', ">\n                                    <li class=\"link \">\n                                        <a href=\"additional-documentation/base-components-base-subscribing-component.html\" data-type=\"entity-link\" data-context-id=\"additional\">base-components-base-subscribing-component</a>\n                                    </li>\n                                    <li class=\"link \">\n                                        <a href=\"additional-documentation/ui-components-file-drop-overlay.html\" data-type=\"entity-link\" data-context-id=\"additional\">ui-components-file-drop-overlay</a>\n                                    </li>\n                                    <li class=\"link \">\n                                        <a href=\"additional-documentation/ui-components-slide-panel.html\" data-type=\"entity-link\" data-context-id=\"additional\">ui-components-slide-panel</a>\n                                    </li>\n                                    <li class=\"link \">\n                                        <a href=\"additional-documentation/ui-components-dialogs.html\" data-type=\"entity-link\" data-context-id=\"additional\">ui-components-dialogs</a>\n                                    </li>\n                                    <li class=\"link \">\n                                        <a href=\"additional-documentation/helpers.html\" data-type=\"entity-link\" data-context-id=\"additional\">helpers</a>\n                                    </li>\n                        </ul>\n                    </li>\n                    <li class=\"chapter modules\">\n                        <a data-type=\"chapter-link\" href=\"modules.html\">\n                            <div class=\"menu-toggler linked\" data-bs-toggle=\"collapse\" ").concat(isNormalMode ? 'data-bs-target="#modules-links"' : 'data-bs-target="#xs-modules-links"', ">\n                                <span class=\"icon ion-ios-archive\"></span>\n                                <span class=\"link-name\">Modules</span>\n                                <span class=\"icon ion-ios-arrow-down\"></span>\n                            </div>\n                        </a>\n                        <ul class=\"links collapse \" ").concat(isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"', ">\n                            <li class=\"link\">\n                                <a href=\"modules/HotkeysModule.html\" data-type=\"entity-link\" >HotkeysModule</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"modules/PlayerModule.html\" data-type=\"entity-link\" >PlayerModule</a>\n                                <li class=\"chapter inner\">\n                                    <div class=\"simple menu-toggler\" data-bs-toggle=\"collapse\" ").concat(isNormalMode ? 'data-bs-target="#directives-links-module-PlayerModule-3034bf5e8545ba80368bae7c3a4021a1009cc80ede22d9a5ef550f5d0d7c0ab00dad34c415ef0bd23963f8a750ef6e9d750573244fabbb97051dbc151070ac6f"' : 'data-bs-target="#xs-directives-links-module-PlayerModule-3034bf5e8545ba80368bae7c3a4021a1009cc80ede22d9a5ef550f5d0d7c0ab00dad34c415ef0bd23963f8a750ef6e9d750573244fabbb97051dbc151070ac6f"', ">\n                                        <span class=\"icon ion-md-code-working\"></span>\n                                        <span>Directives</span>\n                                        <span class=\"icon ion-ios-arrow-down\"></span>\n                                    </div>\n                                    <ul class=\"links collapse\" ").concat(isNormalMode ? 'id="directives-links-module-PlayerModule-3034bf5e8545ba80368bae7c3a4021a1009cc80ede22d9a5ef550f5d0d7c0ab00dad34c415ef0bd23963f8a750ef6e9d750573244fabbb97051dbc151070ac6f"' : 'id="xs-directives-links-module-PlayerModule-3034bf5e8545ba80368bae7c3a4021a1009cc80ede22d9a5ef550f5d0d7c0ab00dad34c415ef0bd23963f8a750ef6e9d750573244fabbb97051dbc151070ac6f"', ">\n                                        <li class=\"link\">\n                                            <a href=\"directives/VisualsDirective.html\" data-type=\"entity-link\" data-context=\"sub-entity\" data-context-id=\"modules\" >VisualsDirective</a>\n                                        </li>\n                                    </ul>\n                                </li>\n                                    <li class=\"chapter inner\">\n                                        <div class=\"simple menu-toggler\" data-bs-toggle=\"collapse\" ").concat(isNormalMode ? 'data-bs-target="#pipes-links-module-PlayerModule-3034bf5e8545ba80368bae7c3a4021a1009cc80ede22d9a5ef550f5d0d7c0ab00dad34c415ef0bd23963f8a750ef6e9d750573244fabbb97051dbc151070ac6f"' : 'data-bs-target="#xs-pipes-links-module-PlayerModule-3034bf5e8545ba80368bae7c3a4021a1009cc80ede22d9a5ef550f5d0d7c0ab00dad34c415ef0bd23963f8a750ef6e9d750573244fabbb97051dbc151070ac6f"', ">\n                                            <span class=\"icon ion-md-add\"></span>\n                                            <span>Pipes</span>\n                                            <span class=\"icon ion-ios-arrow-down\"></span>\n                                        </div>\n                                        <ul class=\"links collapse\" ").concat(isNormalMode ? 'id="pipes-links-module-PlayerModule-3034bf5e8545ba80368bae7c3a4021a1009cc80ede22d9a5ef550f5d0d7c0ab00dad34c415ef0bd23963f8a750ef6e9d750573244fabbb97051dbc151070ac6f"' : 'id="xs-pipes-links-module-PlayerModule-3034bf5e8545ba80368bae7c3a4021a1009cc80ede22d9a5ef550f5d0d7c0ab00dad34c415ef0bd23963f8a750ef6e9d750573244fabbb97051dbc151070ac6f"', ">\n                                            <li class=\"link\">\n                                                <a href=\"pipes/BandPipe.html\" data-type=\"entity-link\" data-context=\"sub-entity\" data-context-id=\"modules\" >BandPipe</a>\n                                            </li>\n                                            <li class=\"link\">\n                                                <a href=\"pipes/TimePipe.html\" data-type=\"entity-link\" data-context=\"sub-entity\" data-context-id=\"modules\" >TimePipe</a>\n                                            </li>\n                                        </ul>\n                                    </li>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"modules/SettingsModule.html\" data-type=\"entity-link\" >SettingsModule</a>\n                            </li>\n                </ul>\n                </li>\n                    <li class=\"chapter\">\n                        <div class=\"simple menu-toggler\" data-bs-toggle=\"collapse\" ").concat(isNormalMode ? 'data-bs-target="#components-links"' : 'data-bs-target="#xs-components-links"', ">\n                            <span class=\"icon ion-md-cog\"></span>\n                            <span>Components</span>\n                            <span class=\"icon ion-ios-arrow-down\"></span>\n                        </div>\n                        <ul class=\"links collapse \" ").concat(isNormalMode ? 'id="components-links"' : 'id="xs-components-links"', ">\n                            <li class=\"link\">\n                                <a href=\"components/AppComponent.html\" data-type=\"entity-link\" >AppComponent</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"components/CoverDisplayComponent.html\" data-type=\"entity-link\" >CoverDisplayComponent</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"components/EqualizerComponent.html\" data-type=\"entity-link\" >EqualizerComponent</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"components/FileDropOverlayComponent.html\" data-type=\"entity-link\" >FileDropOverlayComponent</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"components/HotkeysHelpDialogComponent.html\" data-type=\"entity-link\" >HotkeysHelpDialogComponent</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"components/LibraryComponent.html\" data-type=\"entity-link\" >LibraryComponent</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"components/MetadataSettingsComponent.html\" data-type=\"entity-link\" >MetadataSettingsComponent</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"components/PlayerComponent.html\" data-type=\"entity-link\" >PlayerComponent</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"components/PlaylistComponent.html\" data-type=\"entity-link\" >PlaylistComponent</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"components/PromptDialogComponent.html\" data-type=\"entity-link\" >PromptDialogComponent</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"components/SettingsComponent.html\" data-type=\"entity-link\" >SettingsComponent</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"components/ShellComponent.html\" data-type=\"entity-link\" >ShellComponent</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"components/SlidePanelComponent.html\" data-type=\"entity-link\" >SlidePanelComponent</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"components/StorageSettingsComponent.html\" data-type=\"entity-link\" >StorageSettingsComponent</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"components/ThemeSettingsComponent.html\" data-type=\"entity-link\" >ThemeSettingsComponent</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"components/VisualizerComponent.html\" data-type=\"entity-link\" >VisualizerComponent</a>\n                            </li>\n                        </ul>\n                    </li>\n                        <li class=\"chapter\">\n                            <div class=\"simple menu-toggler\" data-bs-toggle=\"collapse\" ").concat(isNormalMode ? 'data-bs-target="#directives-links"' : 'data-bs-target="#xs-directives-links"', ">\n                                <span class=\"icon ion-md-code-working\"></span>\n                                <span>Directives</span>\n                                <span class=\"icon ion-ios-arrow-down\"></span>\n                            </div>\n                            <ul class=\"links collapse \" ").concat(isNormalMode ? 'id="directives-links"' : 'id="xs-directives-links"', ">\n                                <li class=\"link\">\n                                    <a href=\"directives/VisualsDirective.html\" data-type=\"entity-link\" >VisualsDirective</a>\n                                </li>\n                            </ul>\n                        </li>\n                    <li class=\"chapter\">\n                        <div class=\"simple menu-toggler\" data-bs-toggle=\"collapse\" ").concat(isNormalMode ? 'data-bs-target="#classes-links"' : 'data-bs-target="#xs-classes-links"', ">\n                            <span class=\"icon ion-ios-paper\"></span>\n                            <span>Classes</span>\n                            <span class=\"icon ion-ios-arrow-down\"></span>\n                        </div>\n                        <ul class=\"links collapse \" ").concat(isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"', ">\n                            <li class=\"link\">\n                                <a href=\"classes/FileLoaderService.html\" data-type=\"entity-link\" >FileLoaderService</a>\n                            </li>\n                        </ul>\n                    </li>\n                        <li class=\"chapter\">\n                            <div class=\"simple menu-toggler\" data-bs-toggle=\"collapse\" ").concat(isNormalMode ? 'data-bs-target="#injectables-links"' : 'data-bs-target="#xs-injectables-links"', ">\n                                <span class=\"icon ion-md-arrow-round-down\"></span>\n                                <span>Injectables</span>\n                                <span class=\"icon ion-ios-arrow-down\"></span>\n                            </div>\n                            <ul class=\"links collapse \" ").concat(isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"', ">\n                                <li class=\"link\">\n                                    <a href=\"injectables/AudioService.html\" data-type=\"entity-link\" >AudioService</a>\n                                </li>\n                                <li class=\"link\">\n                                    <a href=\"injectables/BaseSubscribingClass.html\" data-type=\"entity-link\" >BaseSubscribingClass</a>\n                                </li>\n                                <li class=\"link\">\n                                    <a href=\"injectables/GamepadService.html\" data-type=\"entity-link\" >GamepadService</a>\n                                </li>\n                                <li class=\"link\">\n                                    <a href=\"injectables/HotkeysService.html\" data-type=\"entity-link\" >HotkeysService</a>\n                                </li>\n                                <li class=\"link\">\n                                    <a href=\"injectables/Id3TagsService.html\" data-type=\"entity-link\" >Id3TagsService</a>\n                                </li>\n                                <li class=\"link\">\n                                    <a href=\"injectables/LastfmMetadataService.html\" data-type=\"entity-link\" >LastfmMetadataService</a>\n                                </li>\n                                <li class=\"link\">\n                                    <a href=\"injectables/LegacyFileLoaderService.html\" data-type=\"entity-link\" >LegacyFileLoaderService</a>\n                                </li>\n                                <li class=\"link\">\n                                    <a href=\"injectables/LoaderService.html\" data-type=\"entity-link\" >LoaderService</a>\n                                </li>\n                                <li class=\"link\">\n                                    <a href=\"injectables/MediaSessionService.html\" data-type=\"entity-link\" >MediaSessionService</a>\n                                </li>\n                                <li class=\"link\">\n                                    <a href=\"injectables/MetadataService.html\" data-type=\"entity-link\" >MetadataService</a>\n                                </li>\n                                <li class=\"link\">\n                                    <a href=\"injectables/MusicbrainzService.html\" data-type=\"entity-link\" >MusicbrainzService</a>\n                                </li>\n                                <li class=\"link\">\n                                    <a href=\"injectables/NativeBrowserFileLoaderService.html\" data-type=\"entity-link\" >NativeBrowserFileLoaderService</a>\n                                </li>\n                                <li class=\"link\">\n                                    <a href=\"injectables/PlayerService.html\" data-type=\"entity-link\" >PlayerService</a>\n                                </li>\n                                <li class=\"link\">\n                                    <a href=\"injectables/ThemeService.html\" data-type=\"entity-link\" >ThemeService</a>\n                                </li>\n                                <li class=\"link\">\n                                    <a href=\"injectables/TitleService.html\" data-type=\"entity-link\" >TitleService</a>\n                                </li>\n                                <li class=\"link\">\n                                    <a href=\"injectables/UpdateService.html\" data-type=\"entity-link\" >UpdateService</a>\n                                </li>\n                                <li class=\"link\">\n                                    <a href=\"injectables/VisualsService.html\" data-type=\"entity-link\" >VisualsService</a>\n                                </li>\n                                <li class=\"link\">\n                                    <a href=\"injectables/WakelockService.html\" data-type=\"entity-link\" >WakelockService</a>\n                                </li>\n                            </ul>\n                        </li>\n                    <li class=\"chapter\">\n                        <div class=\"simple menu-toggler\" data-bs-toggle=\"collapse\" ").concat(isNormalMode ? 'data-bs-target="#interceptors-links"' : 'data-bs-target="#xs-interceptors-links"', ">\n                            <span class=\"icon ion-ios-swap\"></span>\n                            <span>Interceptors</span>\n                            <span class=\"icon ion-ios-arrow-down\"></span>\n                        </div>\n                        <ul class=\"links collapse \" ").concat(isNormalMode ? 'id="interceptors-links"' : 'id="xs-interceptors-links"', ">\n                            <li class=\"link\">\n                                <a href=\"interceptors/LoaderInterceptor.html\" data-type=\"entity-link\" >LoaderInterceptor</a>\n                            </li>\n                        </ul>\n                    </li>\n                    <li class=\"chapter\">\n                        <div class=\"simple menu-toggler\" data-bs-toggle=\"collapse\" ").concat(isNormalMode ? 'data-bs-target="#interfaces-links"' : 'data-bs-target="#xs-interfaces-links"', ">\n                            <span class=\"icon ion-md-information-circle-outline\"></span>\n                            <span>Interfaces</span>\n                            <span class=\"icon ion-ios-arrow-down\"></span>\n                        </div>\n                        <ul class=\"links collapse \" ").concat(isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"', ">\n                            <li class=\"link\">\n                                <a href=\"interfaces/ActionCache.html\" data-type=\"entity-link\" >ActionCache</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/AnalyserConfig.html\" data-type=\"entity-link\" >AnalyserConfig</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/Chainable.html\" data-type=\"entity-link\" >Chainable</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/Color.html\" data-type=\"entity-link\" >Color</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/CoverColor.html\" data-type=\"entity-link\" >CoverColor</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/CoverColorPalette.html\" data-type=\"entity-link\" >CoverColorPalette</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/FrequencyBarsConfig.html\" data-type=\"entity-link\" >FrequencyBarsConfig</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/GamepadAction.html\" data-type=\"entity-link\" >GamepadAction</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/Hotkey.html\" data-type=\"entity-link\" >Hotkey</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/HotkeyInfo.html\" data-type=\"entity-link\" >HotkeyInfo</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/HotkeysData.html\" data-type=\"entity-link\" >HotkeysData</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/Id3CoverPicture.html\" data-type=\"entity-link\" >Id3CoverPicture</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/Id3Tags.html\" data-type=\"entity-link\" >Id3Tags</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/OsciloscopeConfig.html\" data-type=\"entity-link\" >OsciloscopeConfig</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/PlayState.html\" data-type=\"entity-link\" >PlayState</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/PromptDialogData.html\" data-type=\"entity-link\" >PromptDialogData</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/RemoteCoverPicture.html\" data-type=\"entity-link\" >RemoteCoverPicture</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/Track.html\" data-type=\"entity-link\" >Track</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/TrackMetadata.html\" data-type=\"entity-link\" >TrackMetadata</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/VisualsColorConfig.html\" data-type=\"entity-link\" >VisualsColorConfig</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/VisualsWorkerMessage.html\" data-type=\"entity-link\" >VisualsWorkerMessage</a>\n                            </li>\n                        </ul>\n                    </li>\n                        <li class=\"chapter\">\n                            <div class=\"simple menu-toggler\" data-bs-toggle=\"collapse\" ").concat(isNormalMode ? 'data-bs-target="#pipes-links"' : 'data-bs-target="#xs-pipes-links"', ">\n                                <span class=\"icon ion-md-add\"></span>\n                                <span>Pipes</span>\n                                <span class=\"icon ion-ios-arrow-down\"></span>\n                            </div>\n                            <ul class=\"links collapse \" ").concat(isNormalMode ? 'id="pipes-links"' : 'id="xs-pipes-links"', ">\n                                <li class=\"link\">\n                                    <a href=\"pipes/BandPipe.html\" data-type=\"entity-link\" >BandPipe</a>\n                                </li>\n                                <li class=\"link\">\n                                    <a href=\"pipes/TimePipe.html\" data-type=\"entity-link\" >TimePipe</a>\n                                </li>\n                            </ul>\n                        </li>\n                    <li class=\"chapter\">\n                        <div class=\"simple menu-toggler\" data-bs-toggle=\"collapse\" ").concat(isNormalMode ? 'data-bs-target="#miscellaneous-links"' : 'data-bs-target="#xs-miscellaneous-links"', ">\n                            <span class=\"icon ion-ios-cube\"></span>\n                            <span>Miscellaneous</span>\n                            <span class=\"icon ion-ios-arrow-down\"></span>\n                        </div>\n                        <ul class=\"links collapse \" ").concat(isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"', ">\n                            <li class=\"link\">\n                                <a href=\"miscellaneous/enumerations.html\" data-type=\"entity-link\">Enums</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"miscellaneous/functions.html\" data-type=\"entity-link\">Functions</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"miscellaneous/typealiases.html\" data-type=\"entity-link\">Type aliases</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"miscellaneous/variables.html\" data-type=\"entity-link\">Variables</a>\n                            </li>\n                        </ul>\n                    </li>\n                    <li class=\"divider\"></li>\n                    <li class=\"copyright\">\n                        Documentation generated using <a href=\"https://compodoc.app/\" target=\"_blank\" rel=\"noopener noreferrer\">\n                            <img data-src=\"images/compodoc-vectorise.png\" class=\"img-responsive\" data-type=\"compodoc-logo\">\n                        </a>\n                    </li>\n            </ul>\n        </nav>\n        "));
      this.innerHTML = tp.strings;
    }
  }]);
  return _class;
}( /*#__PURE__*/_wrapNativeSuper(HTMLElement)));