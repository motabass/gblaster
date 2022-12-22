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
                    <a href="index.html" data-type="index-link">motabass</a>
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
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#additional-pages"'
                            : 'data-target="#xs-additional-pages"' }>
                            <span class="icon ion-ios-book"></span>
                            <span>Projects</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="additional-pages"' : 'id="xs-additional-pages"' }>
                                    <li class="link ">
                                        <a href="additional-documentation/base-components-base-subscribing-component.html" data-type="entity-link" data-context-id="additional">base-components-base-subscribing-component</a>
                                    </li>
                                    <li class="link ">
                                        <a href="additional-documentation/ui-components-file-drop-overlay.html" data-type="entity-link" data-context-id="additional">ui-components-file-drop-overlay</a>
                                    </li>
                                    <li class="link ">
                                        <a href="additional-documentation/material-helpers-mat-icon-size.html" data-type="entity-link" data-context-id="additional">material-helpers-mat-icon-size</a>
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
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-toggle="collapse" ${ isNormalMode ?
                                'data-target="#modules-links"' : 'data-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link" >AppModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-AppModule-a900e7f898562d568e0bc69ef575561fec29839a1d3ae29250b5e8019c8dbe718144519308cc616cf3f3c58d114927d698a72566356ec087f69777bc7448a438"' : 'data-target="#xs-components-links-module-AppModule-a900e7f898562d568e0bc69ef575561fec29839a1d3ae29250b5e8019c8dbe718144519308cc616cf3f3c58d114927d698a72566356ec087f69777bc7448a438"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-AppModule-a900e7f898562d568e0bc69ef575561fec29839a1d3ae29250b5e8019c8dbe718144519308cc616cf3f3c58d114927d698a72566356ec087f69777bc7448a438"' :
                                            'id="xs-components-links-module-AppModule-a900e7f898562d568e0bc69ef575561fec29839a1d3ae29250b5e8019c8dbe718144519308cc616cf3f3c58d114927d698a72566356ec087f69777bc7448a438"' }>
                                            <li class="link">
                                                <a href="components/AppComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ShellComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ShellComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/DialogsModule.html" data-type="entity-link" >DialogsModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-DialogsModule-fa27c88a8e53ec328e1d331e0d4fc33cdabb6faa70bbcc39dcc30a8847bedfa8f7b4581c4a7aa0a50c5bea9f3cf50d53413419395dbe633b1c5a93e8e3690daf"' : 'data-target="#xs-components-links-module-DialogsModule-fa27c88a8e53ec328e1d331e0d4fc33cdabb6faa70bbcc39dcc30a8847bedfa8f7b4581c4a7aa0a50c5bea9f3cf50d53413419395dbe633b1c5a93e8e3690daf"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-DialogsModule-fa27c88a8e53ec328e1d331e0d4fc33cdabb6faa70bbcc39dcc30a8847bedfa8f7b4581c4a7aa0a50c5bea9f3cf50d53413419395dbe633b1c5a93e8e3690daf"' :
                                            'id="xs-components-links-module-DialogsModule-fa27c88a8e53ec328e1d331e0d4fc33cdabb6faa70bbcc39dcc30a8847bedfa8f7b4581c4a7aa0a50c5bea9f3cf50d53413419395dbe633b1c5a93e8e3690daf"' }>
                                            <li class="link">
                                                <a href="components/PromptDialogComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PromptDialogComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/HotkeysModule.html" data-type="entity-link" >HotkeysModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-HotkeysModule-bb22b2922c9e2f47af1016b8f9ad39869ea641dfb887ff6687a53fc8452989cae9928e01dd5ed5ac15de8737211a6c6d7829c6d9d31c0967f751f93d99db6022"' : 'data-target="#xs-components-links-module-HotkeysModule-bb22b2922c9e2f47af1016b8f9ad39869ea641dfb887ff6687a53fc8452989cae9928e01dd5ed5ac15de8737211a6c6d7829c6d9d31c0967f751f93d99db6022"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-HotkeysModule-bb22b2922c9e2f47af1016b8f9ad39869ea641dfb887ff6687a53fc8452989cae9928e01dd5ed5ac15de8737211a6c6d7829c6d9d31c0967f751f93d99db6022"' :
                                            'id="xs-components-links-module-HotkeysModule-bb22b2922c9e2f47af1016b8f9ad39869ea641dfb887ff6687a53fc8452989cae9928e01dd5ed5ac15de8737211a6c6d7829c6d9d31c0967f751f93d99db6022"' }>
                                            <li class="link">
                                                <a href="components/HotkeysHelpDialogComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >HotkeysHelpDialogComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/MatIconSizeModule.html" data-type="entity-link" >MatIconSizeModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#directives-links-module-MatIconSizeModule-a4e168ead3780f2a08c768000f130fa9ad2303475f3efb3d319affa628021669ac5b5392a0dc9c974e0357f49c00e426ebfcb972d4d291e23b796621546fb6a9"' : 'data-target="#xs-directives-links-module-MatIconSizeModule-a4e168ead3780f2a08c768000f130fa9ad2303475f3efb3d319affa628021669ac5b5392a0dc9c974e0357f49c00e426ebfcb972d4d291e23b796621546fb6a9"' }>
                                        <span class="icon ion-md-code-working"></span>
                                        <span>Directives</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="directives-links-module-MatIconSizeModule-a4e168ead3780f2a08c768000f130fa9ad2303475f3efb3d319affa628021669ac5b5392a0dc9c974e0357f49c00e426ebfcb972d4d291e23b796621546fb6a9"' :
                                        'id="xs-directives-links-module-MatIconSizeModule-a4e168ead3780f2a08c768000f130fa9ad2303475f3efb3d319affa628021669ac5b5392a0dc9c974e0357f49c00e426ebfcb972d4d291e23b796621546fb6a9"' }>
                                        <li class="link">
                                            <a href="directives/IconSizeDirective.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >IconSizeDirective</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/PlayerModule.html" data-type="entity-link" >PlayerModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-PlayerModule-38d4f59f8fc60edf3965f8b0568ab77d148a4320bd02583e349610188d0eab4befd4a26b66538a9a44571c49bb70f2edd149bb3bfc91dd5432a74801961a087f"' : 'data-target="#xs-components-links-module-PlayerModule-38d4f59f8fc60edf3965f8b0568ab77d148a4320bd02583e349610188d0eab4befd4a26b66538a9a44571c49bb70f2edd149bb3bfc91dd5432a74801961a087f"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-PlayerModule-38d4f59f8fc60edf3965f8b0568ab77d148a4320bd02583e349610188d0eab4befd4a26b66538a9a44571c49bb70f2edd149bb3bfc91dd5432a74801961a087f"' :
                                            'id="xs-components-links-module-PlayerModule-38d4f59f8fc60edf3965f8b0568ab77d148a4320bd02583e349610188d0eab4befd4a26b66538a9a44571c49bb70f2edd149bb3bfc91dd5432a74801961a087f"' }>
                                            <li class="link">
                                                <a href="components/CoverDisplayComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CoverDisplayComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/EqualizerComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EqualizerComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/FileDropOverlayComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FileDropOverlayComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/LibraryComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LibraryComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PlayerComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PlayerComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PlaylistComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PlaylistComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/VisualizerComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >VisualizerComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#directives-links-module-PlayerModule-38d4f59f8fc60edf3965f8b0568ab77d148a4320bd02583e349610188d0eab4befd4a26b66538a9a44571c49bb70f2edd149bb3bfc91dd5432a74801961a087f"' : 'data-target="#xs-directives-links-module-PlayerModule-38d4f59f8fc60edf3965f8b0568ab77d148a4320bd02583e349610188d0eab4befd4a26b66538a9a44571c49bb70f2edd149bb3bfc91dd5432a74801961a087f"' }>
                                        <span class="icon ion-md-code-working"></span>
                                        <span>Directives</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="directives-links-module-PlayerModule-38d4f59f8fc60edf3965f8b0568ab77d148a4320bd02583e349610188d0eab4befd4a26b66538a9a44571c49bb70f2edd149bb3bfc91dd5432a74801961a087f"' :
                                        'id="xs-directives-links-module-PlayerModule-38d4f59f8fc60edf3965f8b0568ab77d148a4320bd02583e349610188d0eab4befd4a26b66538a9a44571c49bb70f2edd149bb3bfc91dd5432a74801961a087f"' }>
                                        <li class="link">
                                            <a href="directives/VisualsDirective.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >VisualsDirective</a>
                                        </li>
                                    </ul>
                                </li>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#pipes-links-module-PlayerModule-38d4f59f8fc60edf3965f8b0568ab77d148a4320bd02583e349610188d0eab4befd4a26b66538a9a44571c49bb70f2edd149bb3bfc91dd5432a74801961a087f"' : 'data-target="#xs-pipes-links-module-PlayerModule-38d4f59f8fc60edf3965f8b0568ab77d148a4320bd02583e349610188d0eab4befd4a26b66538a9a44571c49bb70f2edd149bb3bfc91dd5432a74801961a087f"' }>
                                            <span class="icon ion-md-add"></span>
                                            <span>Pipes</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="pipes-links-module-PlayerModule-38d4f59f8fc60edf3965f8b0568ab77d148a4320bd02583e349610188d0eab4befd4a26b66538a9a44571c49bb70f2edd149bb3bfc91dd5432a74801961a087f"' :
                                            'id="xs-pipes-links-module-PlayerModule-38d4f59f8fc60edf3965f8b0568ab77d148a4320bd02583e349610188d0eab4befd4a26b66538a9a44571c49bb70f2edd149bb3bfc91dd5432a74801961a087f"' }>
                                            <li class="link">
                                                <a href="pipes/BandPipe.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >BandPipe</a>
                                            </li>
                                            <li class="link">
                                                <a href="pipes/TimePipe.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TimePipe</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/SettingsModule.html" data-type="entity-link" >SettingsModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-SettingsModule-b375baedf3cfe08be63aff06d9017598664741dd480dd9e4b6dd596b50f58656c8d9e6836172def9839107ca8bc192c9e5f7293a6680ac754016b31cfb0f8489"' : 'data-target="#xs-components-links-module-SettingsModule-b375baedf3cfe08be63aff06d9017598664741dd480dd9e4b6dd596b50f58656c8d9e6836172def9839107ca8bc192c9e5f7293a6680ac754016b31cfb0f8489"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-SettingsModule-b375baedf3cfe08be63aff06d9017598664741dd480dd9e4b6dd596b50f58656c8d9e6836172def9839107ca8bc192c9e5f7293a6680ac754016b31cfb0f8489"' :
                                            'id="xs-components-links-module-SettingsModule-b375baedf3cfe08be63aff06d9017598664741dd480dd9e4b6dd596b50f58656c8d9e6836172def9839107ca8bc192c9e5f7293a6680ac754016b31cfb0f8489"' }>
                                            <li class="link">
                                                <a href="components/MetadataSettingsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MetadataSettingsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SettingsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SettingsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/StorageSettingsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StorageSettingsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ThemeSettingsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ThemeSettingsComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/SlidePanelModule.html" data-type="entity-link" >SlidePanelModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-SlidePanelModule-a77ab4b0fb1217ac806fddaa5656bbfa06cf1464fa64500d263cfd134585c84adb8daf47fc697c66350248d8b7e9b6538081ed4377d9798be0c9596f7a97a7ff"' : 'data-target="#xs-components-links-module-SlidePanelModule-a77ab4b0fb1217ac806fddaa5656bbfa06cf1464fa64500d263cfd134585c84adb8daf47fc697c66350248d8b7e9b6538081ed4377d9798be0c9596f7a97a7ff"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-SlidePanelModule-a77ab4b0fb1217ac806fddaa5656bbfa06cf1464fa64500d263cfd134585c84adb8daf47fc697c66350248d8b7e9b6538081ed4377d9798be0c9596f7a97a7ff"' :
                                            'id="xs-components-links-module-SlidePanelModule-a77ab4b0fb1217ac806fddaa5656bbfa06cf1464fa64500d263cfd134585c84adb8daf47fc697c66350248d8b7e9b6538081ed4377d9798be0c9596f7a97a7ff"' }>
                                            <li class="link">
                                                <a href="components/SlidePanelComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SlidePanelComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#components-links"' :
                            'data-target="#xs-components-links"' }>
                            <span class="icon ion-md-cog"></span>
                            <span>Components</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="components-links"' : 'id="xs-components-links"' }>
                            <li class="link">
                                <a href="components/FileDropOverlayComponent.html" data-type="entity-link" >FileDropOverlayComponent</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#directives-links"' :
                                'data-target="#xs-directives-links"' }>
                                <span class="icon ion-md-code-working"></span>
                                <span>Directives</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="directives-links"' : 'id="xs-directives-links"' }>
                                <li class="link">
                                    <a href="directives/BaseSubscribingComponent.html" data-type="entity-link" >BaseSubscribingComponent</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#classes-links"' :
                            'data-target="#xs-classes-links"' }>
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
                            <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#injectables-links"' :
                                'data-target="#xs-injectables-links"' }>
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
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#interceptors-links"' :
                            'data-target="#xs-interceptors-links"' }>
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
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#interfaces-links"' :
                            'data-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/ActionCache.html" data-type="entity-link" >ActionCache</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AnalyserConfig.html" data-type="entity-link" >AnalyserConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Chainable.html" data-type="entity-link" >Chainable</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Color.html" data-type="entity-link" >Color</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CoverColor.html" data-type="entity-link" >CoverColor</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CoverColorPalette.html" data-type="entity-link" >CoverColorPalette</a>
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
                                <a href="interfaces/OsciloscopeConfig.html" data-type="entity-link" >OsciloscopeConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PromptDialogData.html" data-type="entity-link" >PromptDialogData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RemoteCoverPicture.html" data-type="entity-link" >RemoteCoverPicture</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Song.html" data-type="entity-link" >Song</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SongMetadata.html" data-type="entity-link" >SongMetadata</a>
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
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#miscellaneous-links"'
                            : 'data-target="#xs-miscellaneous-links"' }>
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
                        Documentation generated using <a href="https://compodoc.app/" target="_blank">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});