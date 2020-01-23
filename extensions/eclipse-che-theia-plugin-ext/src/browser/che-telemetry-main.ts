/*********************************************************************
 * Copyright (c) 2020 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 **********************************************************************/

import { interfaces, postConstruct } from 'inversify';
import { CheTelemetryMain } from '../common/che-protocol';
import { CheApiService } from '../common/che-protocol';
import * as net from 'net';

export class CheTelemetryMainImpl implements CheTelemetryMain {

    private readonly cheApiService: CheApiService;

    constructor(container: interfaces.Container) {
        this.cheApiService = container.get(CheApiService);
    }

    @postConstruct()
    protected async init(): Promise<void> {
        const client = new net.Socket();
        client.connect(32000, () => {
           console.log('Connected');
           client.write('Hello, server! Love, Client.');
        });

        client.on('data', data => {
            console.log('Received: ' + data);
            client.destroy(); // kill client after server's response
        });

        client.on('close', () => {
            console.log('Connection closed');
        });
    }

    async $event(id: string, ownerId: string, properties: [string, string][]): Promise<void> {
        // TODO : get the infos from the browser
        const ip = '';

        let agent = '';
        let resolution = '';
        const navigator = window.navigator;
        if (navigator) {
            agent = navigator.userAgent;
        }
        const screen = window.screen;
        if (screen) {
            const width = screen.width;
            const height = screen.height;
            if (height && width) {
                resolution = '' + width + 'x' + height;
            }
        }

        return this.cheApiService.submitTelemetryEvent(id, ownerId, ip, agent, resolution, properties);
    }
}
