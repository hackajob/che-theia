/*********************************************************************
 * Copyright (c) 2019 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 **********************************************************************/

import * as theia from '@theia/plugin';
import * as che from '@eclipse-che/plugin';
import * as net from 'net';

export function start(context: theia.PluginContext) {
    net.createServer(conn => {
            const remoteAddress = conn.remoteAddress + ':' + conn.remotePort;
            console.log('new client connection from %s', remoteAddress);
            conn.on('data', onConnData);
            conn.once('close', onConnClose);
            conn.on('error', onConnError);
            function onConnData(d: string) {
              console.log('connection data from %s: %j', remoteAddress, d);
              conn.write(remoteAddress);
            }
            function onConnClose() {
              console.log('connection from %s closed', remoteAddress);
            }
            // tslint:disable-next-line:no-any
            function onConnError(err: any) {
              console.log('Connection %s error: %s', remoteAddress, err.message);
          }
    }).listen(32000);

    che.telemetry.event('WORKSPACE_OPENED', context.extensionPath, [
    ]);

    che.telemetry.addCommandListener('git.commit', () => {
        che.telemetry.event('COMMIT_LOCALLY', context.extensionPath, []);
    });

    che.telemetry.addCommandListener('git.push', () => {
        che.telemetry.event('PUSH_TO_REMOTE', context.extensionPath, []);
    });

    theia.workspace.onDidChangeTextDocument((e: theia.TextDocumentChangeEvent) => {
        che.telemetry.event('EDITOR_USED', context.extensionPath,
            [
                ['programming language', e.document.languageId]
            ]);
    });
}

export function stop() {

}
