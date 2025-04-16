'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">gblaster</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>README
                            </a>
                        </li>
                        <li class="link">
                            <a href="changelog.html"  data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>CHANGELOG
                            </a>
                        </li>
                        <li class="link">
                            <a href="license.html"  data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>LICENSE
                            </a>
                        </li>
                        <li class="link">
                            <a href="todo.html"  data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>TODO
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>
                    </ul>
                </li>
                    <li class="chapter additional">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#additional-pages"'
                            : 'data-bs-target="#xs-additional-pages"' }>
                            <span class="icon ion-ios-book"></span>
                            <span>Projects</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="additional-pages"' : 'id="xs-additional-pages"' }>
                                    <li class="link ">
                                        <a href="additional-documentation/ui-components-file-drop-overlay.html" data-type="entity-link" data-context-id="additional">ui-components-file-drop-overlay</a>
                                    </li>
                                    <li class="link ">
                                        <a href="additional-documentation/ui-components-slide-panel.html" data-type="entity-link" data-context-id="additional">ui-components-slide-panel</a>
                                    </li>
                                    <li class="link ">
                                        <a href="additional-documentation/ui-components-dialogs.html" data-type="entity-link" data-context-id="additional">ui-components-dialogs</a>
                                    </li>
                                    <li class="link ">
                                        <a href="additional-documentation/helpers.html" data-type="entity-link" data-context-id="additional">helpers</a>
                                    </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#components-links"' :
                            'data-bs-target="#xs-components-links"' }>
                            <span class="icon ion-md-cog"></span>
                            <span>Components</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="components-links"' : 'id="xs-components-links"' }>
                            <li class="link">
                                <a href="components/AppComponent.html" data-type="entity-link" >AppComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CoverDisplayComponent.html" data-type="entity-link" >CoverDisplayComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/EqualizerComponent.html" data-type="entity-link" >EqualizerComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/FileDropOverlayComponent.html" data-type="entity-link" >FileDropOverlayComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/HotkeysHelpDialogComponent.html" data-type="entity-link" >HotkeysHelpDialogComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/LibraryComponent.html" data-type="entity-link" >LibraryComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MetadataSettingsComponent.html" data-type="entity-link" >MetadataSettingsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PlayerComponent.html" data-type="entity-link" >PlayerComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PlayerToolbarComponent.html" data-type="entity-link" >PlayerToolbarComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PlaylistComponent.html" data-type="entity-link" >PlaylistComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PromptDialogComponent.html" data-type="entity-link" >PromptDialogComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SettingsComponent.html" data-type="entity-link" >SettingsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ShellComponent.html" data-type="entity-link" >ShellComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SlidePanelComponent.html" data-type="entity-link" >SlidePanelComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/StorageSettingsComponent.html" data-type="entity-link" >StorageSettingsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ThemeSettingsComponent.html" data-type="entity-link" >ThemeSettingsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/VisualizerComponent.html" data-type="entity-link" >VisualizerComponent</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#directives-links"' :
                                'data-bs-target="#xs-directives-links"' }>
                                <span class="icon ion-md-code-working"></span>
                                <span>Directives</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="directives-links"' : 'id="xs-directives-links"' }>
                                <li class="link">
                                    <a href="directives/VisualsDirective.html" data-type="entity-link" >VisualsDirective</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#classes-links"' :
                            'data-bs-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/FileLoaderService.html" data-type="entity-link" >FileLoaderService</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#injectables-links"' :
                                'data-bs-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/AudioService.html" data-type="entity-link" >AudioService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/GamepadService.html" data-type="entity-link" >GamepadService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/HotkeysService.html" data-type="entity-link" >HotkeysService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/Id3TagsService.html" data-type="entity-link" >Id3TagsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/LastfmMetadataService.html" data-type="entity-link" >LastfmMetadataService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/LegacyFileLoaderService.html" data-type="entity-link" >LegacyFileLoaderService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/LibraryService.html" data-type="entity-link" >LibraryService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/LoaderService.html" data-type="entity-link" >LoaderService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MediaSessionService.html" data-type="entity-link" >MediaSessionService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MetadataService.html" data-type="entity-link" >MetadataService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MusicbrainzService.html" data-type="entity-link" >MusicbrainzService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/NativeBrowserFileLoaderService.html" data-type="entity-link" >NativeBrowserFileLoaderService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PlayerService.html" data-type="entity-link" >PlayerService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ThemeService.html" data-type="entity-link" >ThemeService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/TitleService.html" data-type="entity-link" >TitleService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UpdateService.html" data-type="entity-link" >UpdateService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/VisualsService.html" data-type="entity-link" >VisualsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/WakelockService.html" data-type="entity-link" >WakelockService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interceptors-links"' :
                            'data-bs-target="#xs-interceptors-links"' }>
                            <span class="icon ion-ios-swap"></span>
                            <span>Interceptors</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="interceptors-links"' : 'id="xs-interceptors-links"' }>
                            <li class="link">
                                <a href="interceptors/LoaderInterceptor.html" data-type="entity-link" >LoaderInterceptor</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interfaces-links"' :
                            'data-bs-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/ActionCache.html" data-type="entity-link" >ActionCache</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Album.html" data-type="entity-link" >Album</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AnalyserConfig.html" data-type="entity-link" >AnalyserConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AxisGamepadAction.html" data-type="entity-link" >AxisGamepadAction</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BarsVisualizerOptions.html" data-type="entity-link" >BarsVisualizerOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BaseVisualizerOptions.html" data-type="entity-link" >BaseVisualizerOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ButtonGamepadAction.html" data-type="entity-link" >ButtonGamepadAction</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Chainable.html" data-type="entity-link" >Chainable</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Color.html" data-type="entity-link" >Color</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ColorConfig.html" data-type="entity-link" >ColorConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CoverColor.html" data-type="entity-link" >CoverColor</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CoverColorPalette.html" data-type="entity-link" >CoverColorPalette</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DirHandleEntry.html" data-type="entity-link" >DirHandleEntry</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FileData.html" data-type="entity-link" >FileData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FrequencyBarsConfig.html" data-type="entity-link" >FrequencyBarsConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GamepadAction.html" data-type="entity-link" >GamepadAction</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Hotkey.html" data-type="entity-link" >Hotkey</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/HotkeyInfo.html" data-type="entity-link" >HotkeyInfo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/HotkeysData.html" data-type="entity-link" >HotkeysData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Id3CoverPicture.html" data-type="entity-link" >Id3CoverPicture</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Id3Tags.html" data-type="entity-link" >Id3Tags</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IndexedDbTrackMetadata.html" data-type="entity-link" >IndexedDbTrackMetadata</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/LastfmAlbum.html" data-type="entity-link" >LastfmAlbum</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/LastfmErrorResponse.html" data-type="entity-link" >LastfmErrorResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/LastfmImage.html" data-type="entity-link" >LastfmImage</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/LastfmSuccessResponse.html" data-type="entity-link" >LastfmSuccessResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/OsciloscopeConfig.html" data-type="entity-link" >OsciloscopeConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/OscVisualizerOptions.html" data-type="entity-link" >OscVisualizerOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PromptDialogData.html" data-type="entity-link" >PromptDialogData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RemoteCoverArtUrls.html" data-type="entity-link" >RemoteCoverArtUrls</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TagsWorkerRequest.html" data-type="entity-link" >TagsWorkerRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TagsWorkerResponse.html" data-type="entity-link" >TagsWorkerResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Track.html" data-type="entity-link" >Track</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TrackMetadata.html" data-type="entity-link" >TrackMetadata</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VisualsColorConfig.html" data-type="entity-link" >VisualsColorConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VisualsWorkerMessage.html" data-type="entity-link" >VisualsWorkerMessage</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#pipes-links"' :
                                'data-bs-target="#xs-pipes-links"' }>
                                <span class="icon ion-md-add"></span>
                                <span>Pipes</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="pipes-links"' : 'id="xs-pipes-links"' }>
                                <li class="link">
                                    <a href="pipes/BandPipe.html" data-type="entity-link" >BandPipe</a>
                                </li>
                                <li class="link">
                                    <a href="pipes/BitratePipe.html" data-type="entity-link" >BitratePipe</a>
                                </li>
                                <li class="link">
                                    <a href="pipes/TimePipe.html" data-type="entity-link" >TimePipe</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/enumerations.html" data-type="entity-link">Enums</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/typealiases.html" data-type="entity-link">Type aliases</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank" rel="noopener noreferrer">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});