'use strict';

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == _typeof(e) || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _wrapNativeSuper(t) { var r = "function" == typeof Map ? new Map() : void 0; return _wrapNativeSuper = function _wrapNativeSuper(t) { if (null === t || !_isNativeFunction(t)) return t; if ("function" != typeof t) throw new TypeError("Super expression must either be null or a function"); if (void 0 !== r) { if (r.has(t)) return r.get(t); r.set(t, Wrapper); } function Wrapper() { return _construct(t, arguments, _getPrototypeOf(this).constructor); } return Wrapper.prototype = Object.create(t.prototype, { constructor: { value: Wrapper, enumerable: !1, writable: !0, configurable: !0 } }), _setPrototypeOf(Wrapper, t); }, _wrapNativeSuper(t); }
function _construct(t, e, r) { if (_isNativeReflectConstruct()) return Reflect.construct.apply(null, arguments); var o = [null]; o.push.apply(o, e); var p = new (t.bind.apply(t, o))(); return r && _setPrototypeOf(p, r.prototype), p; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _isNativeFunction(t) { try { return -1 !== Function.toString.call(t).indexOf("[native code]"); } catch (n) { return "function" == typeof t; } }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
customElements.define('compodoc-menu', /*#__PURE__*/function (_HTMLElement) {
  function _class() {
    var _this;
    _classCallCheck(this, _class);
    _this = _callSuper(this, _class);
    _this.isNormalMode = _this.getAttribute('mode') === 'normal';
    return _this;
  }
  _inherits(_class, _HTMLElement);
  return _createClass(_class, [{
    key: "connectedCallback",
    value: function connectedCallback() {
      this.render(this.isNormalMode);
    }
  }, {
    key: "render",
    value: function render(isNormalMode) {
      var tp = lithtml.html("\n        <nav>\n            <ul class=\"list\">\n                <li class=\"title\">\n                    <a href=\"index.html\" data-type=\"index-link\">gblaster</a>\n                </li>\n\n                <li class=\"divider\"></li>\n                ".concat(isNormalMode ? "<div id=\"book-search-input\" role=\"search\"><input type=\"text\" placeholder=\"Type to search\"></div>" : '', "\n                <li class=\"chapter\">\n                    <a data-type=\"chapter-link\" href=\"index.html\"><span class=\"icon ion-ios-home\"></span>Getting started</a>\n                    <ul class=\"links\">\n                        <li class=\"link\">\n                            <a href=\"overview.html\" data-type=\"chapter-link\">\n                                <span class=\"icon ion-ios-keypad\"></span>Overview\n                            </a>\n                        </li>\n                        <li class=\"link\">\n                            <a href=\"index.html\" data-type=\"chapter-link\">\n                                <span class=\"icon ion-ios-paper\"></span>README\n                            </a>\n                        </li>\n                        <li class=\"link\">\n                            <a href=\"changelog.html\"  data-type=\"chapter-link\">\n                                <span class=\"icon ion-ios-paper\"></span>CHANGELOG\n                            </a>\n                        </li>\n                        <li class=\"link\">\n                            <a href=\"license.html\"  data-type=\"chapter-link\">\n                                <span class=\"icon ion-ios-paper\"></span>LICENSE\n                            </a>\n                        </li>\n                        <li class=\"link\">\n                            <a href=\"todo.html\"  data-type=\"chapter-link\">\n                                <span class=\"icon ion-ios-paper\"></span>TODO\n                            </a>\n                        </li>\n                                <li class=\"link\">\n                                    <a href=\"dependencies.html\" data-type=\"chapter-link\">\n                                        <span class=\"icon ion-ios-list\"></span>Dependencies\n                                    </a>\n                                </li>\n                                <li class=\"link\">\n                                    <a href=\"properties.html\" data-type=\"chapter-link\">\n                                        <span class=\"icon ion-ios-apps\"></span>Properties\n                                    </a>\n                                </li>\n                    </ul>\n                </li>\n                    <li class=\"chapter additional\">\n                        <div class=\"simple menu-toggler\" data-bs-toggle=\"collapse\" ").concat(isNormalMode ? 'data-bs-target="#additional-pages"' : 'data-bs-target="#xs-additional-pages"', ">\n                            <span class=\"icon ion-ios-book\"></span>\n                            <span>Projects</span>\n                            <span class=\"icon ion-ios-arrow-down\"></span>\n                        </div>\n                        <ul class=\"links collapse \" ").concat(isNormalMode ? 'id="additional-pages"' : 'id="xs-additional-pages"', ">\n                                    <li class=\"link \">\n                                        <a href=\"additional-documentation/ui-components-file-drop-overlay.html\" data-type=\"entity-link\" data-context-id=\"additional\">ui-components-file-drop-overlay</a>\n                                    </li>\n                                    <li class=\"link \">\n                                        <a href=\"additional-documentation/ui-components-slide-panel.html\" data-type=\"entity-link\" data-context-id=\"additional\">ui-components-slide-panel</a>\n                                    </li>\n                                    <li class=\"link \">\n                                        <a href=\"additional-documentation/ui-components-dialogs.html\" data-type=\"entity-link\" data-context-id=\"additional\">ui-components-dialogs</a>\n                                    </li>\n                                    <li class=\"link \">\n                                        <a href=\"additional-documentation/helpers.html\" data-type=\"entity-link\" data-context-id=\"additional\">helpers</a>\n                                    </li>\n                        </ul>\n                    </li>\n                    <li class=\"chapter\">\n                        <div class=\"simple menu-toggler\" data-bs-toggle=\"collapse\" ").concat(isNormalMode ? 'data-bs-target="#components-links"' : 'data-bs-target="#xs-components-links"', ">\n                            <span class=\"icon ion-md-cog\"></span>\n                            <span>Components</span>\n                            <span class=\"icon ion-ios-arrow-down\"></span>\n                        </div>\n                        <ul class=\"links collapse \" ").concat(isNormalMode ? 'id="components-links"' : 'id="xs-components-links"', ">\n                            <li class=\"link\">\n                                <a href=\"components/AppComponent.html\" data-type=\"entity-link\" >AppComponent</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"components/CoverDisplayComponent.html\" data-type=\"entity-link\" >CoverDisplayComponent</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"components/EqualizerComponent.html\" data-type=\"entity-link\" >EqualizerComponent</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"components/FileDropOverlayComponent.html\" data-type=\"entity-link\" >FileDropOverlayComponent</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"components/HotkeysHelpDialogComponent.html\" data-type=\"entity-link\" >HotkeysHelpDialogComponent</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"components/LibraryComponent.html\" data-type=\"entity-link\" >LibraryComponent</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"components/MetadataSettingsComponent.html\" data-type=\"entity-link\" >MetadataSettingsComponent</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"components/PlayerComponent.html\" data-type=\"entity-link\" >PlayerComponent</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"components/PlayerToolbarComponent.html\" data-type=\"entity-link\" >PlayerToolbarComponent</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"components/PlaylistComponent.html\" data-type=\"entity-link\" >PlaylistComponent</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"components/PromptDialogComponent.html\" data-type=\"entity-link\" >PromptDialogComponent</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"components/SettingsComponent.html\" data-type=\"entity-link\" >SettingsComponent</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"components/ShellComponent.html\" data-type=\"entity-link\" >ShellComponent</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"components/SlidePanelComponent.html\" data-type=\"entity-link\" >SlidePanelComponent</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"components/StorageSettingsComponent.html\" data-type=\"entity-link\" >StorageSettingsComponent</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"components/ThemeSettingsComponent.html\" data-type=\"entity-link\" >ThemeSettingsComponent</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"components/VisualizerComponent.html\" data-type=\"entity-link\" >VisualizerComponent</a>\n                            </li>\n                        </ul>\n                    </li>\n                        <li class=\"chapter\">\n                            <div class=\"simple menu-toggler\" data-bs-toggle=\"collapse\" ").concat(isNormalMode ? 'data-bs-target="#directives-links"' : 'data-bs-target="#xs-directives-links"', ">\n                                <span class=\"icon ion-md-code-working\"></span>\n                                <span>Directives</span>\n                                <span class=\"icon ion-ios-arrow-down\"></span>\n                            </div>\n                            <ul class=\"links collapse \" ").concat(isNormalMode ? 'id="directives-links"' : 'id="xs-directives-links"', ">\n                                <li class=\"link\">\n                                    <a href=\"directives/VisualsDirective.html\" data-type=\"entity-link\" >VisualsDirective</a>\n                                </li>\n                            </ul>\n                        </li>\n                    <li class=\"chapter\">\n                        <div class=\"simple menu-toggler\" data-bs-toggle=\"collapse\" ").concat(isNormalMode ? 'data-bs-target="#classes-links"' : 'data-bs-target="#xs-classes-links"', ">\n                            <span class=\"icon ion-ios-paper\"></span>\n                            <span>Classes</span>\n                            <span class=\"icon ion-ios-arrow-down\"></span>\n                        </div>\n                        <ul class=\"links collapse \" ").concat(isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"', ">\n                            <li class=\"link\">\n                                <a href=\"classes/FileLoaderService.html\" data-type=\"entity-link\" >FileLoaderService</a>\n                            </li>\n                        </ul>\n                    </li>\n                        <li class=\"chapter\">\n                            <div class=\"simple menu-toggler\" data-bs-toggle=\"collapse\" ").concat(isNormalMode ? 'data-bs-target="#injectables-links"' : 'data-bs-target="#xs-injectables-links"', ">\n                                <span class=\"icon ion-md-arrow-round-down\"></span>\n                                <span>Injectables</span>\n                                <span class=\"icon ion-ios-arrow-down\"></span>\n                            </div>\n                            <ul class=\"links collapse \" ").concat(isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"', ">\n                                <li class=\"link\">\n                                    <a href=\"injectables/AudioService.html\" data-type=\"entity-link\" >AudioService</a>\n                                </li>\n                                <li class=\"link\">\n                                    <a href=\"injectables/GamepadService.html\" data-type=\"entity-link\" >GamepadService</a>\n                                </li>\n                                <li class=\"link\">\n                                    <a href=\"injectables/HotkeysService.html\" data-type=\"entity-link\" >HotkeysService</a>\n                                </li>\n                                <li class=\"link\">\n                                    <a href=\"injectables/Id3TagsService.html\" data-type=\"entity-link\" >Id3TagsService</a>\n                                </li>\n                                <li class=\"link\">\n                                    <a href=\"injectables/LastfmMetadataService.html\" data-type=\"entity-link\" >LastfmMetadataService</a>\n                                </li>\n                                <li class=\"link\">\n                                    <a href=\"injectables/LegacyFileLoaderService.html\" data-type=\"entity-link\" >LegacyFileLoaderService</a>\n                                </li>\n                                <li class=\"link\">\n                                    <a href=\"injectables/LibraryService.html\" data-type=\"entity-link\" >LibraryService</a>\n                                </li>\n                                <li class=\"link\">\n                                    <a href=\"injectables/LoaderService.html\" data-type=\"entity-link\" >LoaderService</a>\n                                </li>\n                                <li class=\"link\">\n                                    <a href=\"injectables/MediaSessionService.html\" data-type=\"entity-link\" >MediaSessionService</a>\n                                </li>\n                                <li class=\"link\">\n                                    <a href=\"injectables/MetadataService.html\" data-type=\"entity-link\" >MetadataService</a>\n                                </li>\n                                <li class=\"link\">\n                                    <a href=\"injectables/MusicbrainzService.html\" data-type=\"entity-link\" >MusicbrainzService</a>\n                                </li>\n                                <li class=\"link\">\n                                    <a href=\"injectables/NativeBrowserFileLoaderService.html\" data-type=\"entity-link\" >NativeBrowserFileLoaderService</a>\n                                </li>\n                                <li class=\"link\">\n                                    <a href=\"injectables/PlayerService.html\" data-type=\"entity-link\" >PlayerService</a>\n                                </li>\n                                <li class=\"link\">\n                                    <a href=\"injectables/ThemeService.html\" data-type=\"entity-link\" >ThemeService</a>\n                                </li>\n                                <li class=\"link\">\n                                    <a href=\"injectables/TitleService.html\" data-type=\"entity-link\" >TitleService</a>\n                                </li>\n                                <li class=\"link\">\n                                    <a href=\"injectables/UpdateService.html\" data-type=\"entity-link\" >UpdateService</a>\n                                </li>\n                                <li class=\"link\">\n                                    <a href=\"injectables/VisualsService.html\" data-type=\"entity-link\" >VisualsService</a>\n                                </li>\n                                <li class=\"link\">\n                                    <a href=\"injectables/WakelockService.html\" data-type=\"entity-link\" >WakelockService</a>\n                                </li>\n                            </ul>\n                        </li>\n                    <li class=\"chapter\">\n                        <div class=\"simple menu-toggler\" data-bs-toggle=\"collapse\" ").concat(isNormalMode ? 'data-bs-target="#interceptors-links"' : 'data-bs-target="#xs-interceptors-links"', ">\n                            <span class=\"icon ion-ios-swap\"></span>\n                            <span>Interceptors</span>\n                            <span class=\"icon ion-ios-arrow-down\"></span>\n                        </div>\n                        <ul class=\"links collapse \" ").concat(isNormalMode ? 'id="interceptors-links"' : 'id="xs-interceptors-links"', ">\n                            <li class=\"link\">\n                                <a href=\"interceptors/LoaderInterceptor.html\" data-type=\"entity-link\" >LoaderInterceptor</a>\n                            </li>\n                        </ul>\n                    </li>\n                    <li class=\"chapter\">\n                        <div class=\"simple menu-toggler\" data-bs-toggle=\"collapse\" ").concat(isNormalMode ? 'data-bs-target="#interfaces-links"' : 'data-bs-target="#xs-interfaces-links"', ">\n                            <span class=\"icon ion-md-information-circle-outline\"></span>\n                            <span>Interfaces</span>\n                            <span class=\"icon ion-ios-arrow-down\"></span>\n                        </div>\n                        <ul class=\"links collapse \" ").concat(isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"', ">\n                            <li class=\"link\">\n                                <a href=\"interfaces/ActionCache.html\" data-type=\"entity-link\" >ActionCache</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/Album.html\" data-type=\"entity-link\" >Album</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/AnalyserConfig.html\" data-type=\"entity-link\" >AnalyserConfig</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/AxisGamepadAction.html\" data-type=\"entity-link\" >AxisGamepadAction</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/BarsVisualizerOptions.html\" data-type=\"entity-link\" >BarsVisualizerOptions</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/BaseVisualizerOptions.html\" data-type=\"entity-link\" >BaseVisualizerOptions</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/ButtonGamepadAction.html\" data-type=\"entity-link\" >ButtonGamepadAction</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/Chainable.html\" data-type=\"entity-link\" >Chainable</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/Color.html\" data-type=\"entity-link\" >Color</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/ColorConfig.html\" data-type=\"entity-link\" >ColorConfig</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/CoverColor.html\" data-type=\"entity-link\" >CoverColor</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/CoverColorPalette.html\" data-type=\"entity-link\" >CoverColorPalette</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/DirHandleEntry.html\" data-type=\"entity-link\" >DirHandleEntry</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/FileData.html\" data-type=\"entity-link\" >FileData</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/FrequencyBarsConfig.html\" data-type=\"entity-link\" >FrequencyBarsConfig</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/GamepadAction.html\" data-type=\"entity-link\" >GamepadAction</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/Hotkey.html\" data-type=\"entity-link\" >Hotkey</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/HotkeyInfo.html\" data-type=\"entity-link\" >HotkeyInfo</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/HotkeysData.html\" data-type=\"entity-link\" >HotkeysData</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/Id3CoverPicture.html\" data-type=\"entity-link\" >Id3CoverPicture</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/Id3Tags.html\" data-type=\"entity-link\" >Id3Tags</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/IndexedDbTrackMetadata.html\" data-type=\"entity-link\" >IndexedDbTrackMetadata</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/LastfmAlbum.html\" data-type=\"entity-link\" >LastfmAlbum</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/LastfmErrorResponse.html\" data-type=\"entity-link\" >LastfmErrorResponse</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/LastfmImage.html\" data-type=\"entity-link\" >LastfmImage</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/LastfmSuccessResponse.html\" data-type=\"entity-link\" >LastfmSuccessResponse</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/OsciloscopeConfig.html\" data-type=\"entity-link\" >OsciloscopeConfig</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/OscVisualizerOptions.html\" data-type=\"entity-link\" >OscVisualizerOptions</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/PromptDialogData.html\" data-type=\"entity-link\" >PromptDialogData</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/RemoteCoverArtUrls.html\" data-type=\"entity-link\" >RemoteCoverArtUrls</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/TagsWorkerRequest.html\" data-type=\"entity-link\" >TagsWorkerRequest</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/TagsWorkerResponse.html\" data-type=\"entity-link\" >TagsWorkerResponse</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/Track.html\" data-type=\"entity-link\" >Track</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/TrackMetadata.html\" data-type=\"entity-link\" >TrackMetadata</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/VisualsColorConfig.html\" data-type=\"entity-link\" >VisualsColorConfig</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"interfaces/VisualsWorkerMessage.html\" data-type=\"entity-link\" >VisualsWorkerMessage</a>\n                            </li>\n                        </ul>\n                    </li>\n                        <li class=\"chapter\">\n                            <div class=\"simple menu-toggler\" data-bs-toggle=\"collapse\" ").concat(isNormalMode ? 'data-bs-target="#pipes-links"' : 'data-bs-target="#xs-pipes-links"', ">\n                                <span class=\"icon ion-md-add\"></span>\n                                <span>Pipes</span>\n                                <span class=\"icon ion-ios-arrow-down\"></span>\n                            </div>\n                            <ul class=\"links collapse \" ").concat(isNormalMode ? 'id="pipes-links"' : 'id="xs-pipes-links"', ">\n                                <li class=\"link\">\n                                    <a href=\"pipes/BandPipe.html\" data-type=\"entity-link\" >BandPipe</a>\n                                </li>\n                                <li class=\"link\">\n                                    <a href=\"pipes/BitratePipe.html\" data-type=\"entity-link\" >BitratePipe</a>\n                                </li>\n                                <li class=\"link\">\n                                    <a href=\"pipes/TimePipe.html\" data-type=\"entity-link\" >TimePipe</a>\n                                </li>\n                            </ul>\n                        </li>\n                    <li class=\"chapter\">\n                        <div class=\"simple menu-toggler\" data-bs-toggle=\"collapse\" ").concat(isNormalMode ? 'data-bs-target="#miscellaneous-links"' : 'data-bs-target="#xs-miscellaneous-links"', ">\n                            <span class=\"icon ion-ios-cube\"></span>\n                            <span>Miscellaneous</span>\n                            <span class=\"icon ion-ios-arrow-down\"></span>\n                        </div>\n                        <ul class=\"links collapse \" ").concat(isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"', ">\n                            <li class=\"link\">\n                                <a href=\"miscellaneous/enumerations.html\" data-type=\"entity-link\">Enums</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"miscellaneous/functions.html\" data-type=\"entity-link\">Functions</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"miscellaneous/typealiases.html\" data-type=\"entity-link\">Type aliases</a>\n                            </li>\n                            <li class=\"link\">\n                                <a href=\"miscellaneous/variables.html\" data-type=\"entity-link\">Variables</a>\n                            </li>\n                        </ul>\n                    </li>\n                    <li class=\"divider\"></li>\n                    <li class=\"copyright\">\n                        Documentation generated using <a href=\"https://compodoc.app/\" target=\"_blank\" rel=\"noopener noreferrer\">\n                            <img data-src=\"images/compodoc-vectorise.png\" class=\"img-responsive\" data-type=\"compodoc-logo\">\n                        </a>\n                    </li>\n            </ul>\n        </nav>\n        "));
      this.innerHTML = tp.strings;
    }
  }]);
}(/*#__PURE__*/_wrapNativeSuper(HTMLElement)));