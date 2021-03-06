"use strict";

namespace Msal {
    export class AuthenticationRequestParameters {
        authorityInstance: Authority;
        clientId: string;
        nonce: string;
        state: string;
        correlationId: string;
        xClientVer: string;
        xClientSku: string;
        scopes: Array<string>;
        responseType: string;
        promptValue: string;
        extraQueryParameters: string;
        loginHint: string;
        domainHint: string;
        redirectUri: string;
        public get authority(): string {
            return this.authorityInstance.CanonicalAuthority;
        }

        constructor(authority: Authority, clientId: string, scope: Array<string>, responseType: string, redirectUri: string) {
            this.authorityInstance = authority;
            this.clientId = clientId;
            this.scopes = scope;
            this.responseType = responseType;
            this.redirectUri = redirectUri;
            // randomly generated values
            this.correlationId = Utils.createNewGuid();
            this.state = Utils.createNewGuid();
            this.nonce = Utils.createNewGuid();
            // telemetry information
            this.xClientSku = "MSAL.JS";
            this.xClientVer = Utils.getLibraryVersion();
        }

        createNavigateUrl(scopes: Array<string>): string {
            if (!scopes) {
                scopes = [this.clientId];
            }

            if (scopes.indexOf(this.clientId) === -1) {
                scopes.push(this.clientId);
            }

            const str: Array<string> = [];
            str.push("response_type=" + this.responseType);
            this.translateclientIdUsedInScope(scopes);
            str.push("scope=" + encodeURIComponent(this.parseScope(scopes)));
            str.push("client_id=" + encodeURIComponent(this.clientId));
            str.push("redirect_uri=" + encodeURIComponent(this.redirectUri));
            str.push("state=" + encodeURIComponent(this.state));
            str.push("nonce=" + encodeURIComponent(this.nonce));
            str.push("client_info=1");
            str.push("slice=testslice");
            str.push("uid=true");
            str.push(`x-client-SKU=${this.xClientSku}`);
            str.push(`x-client-Ver=${this.xClientVer}`);

            if (this.extraQueryParameters) {
                str.push(this.extraQueryParameters);
            }

            str.push("client-request-id=" + encodeURIComponent(this.correlationId));
            let authEndpoint = this.authorityInstance.AuthorizationEndpoint;

            // If the endpoint already has queryparams, lets add to it, otherwise add the first one
            if (authEndpoint.indexOf("?") < 0) {
                authEndpoint += '?';
            }
            else {
                authEndpoint += '&';
            }

            let requestUrl: string = `${authEndpoint}${str.join("&")}`;
            return requestUrl;
        }

        translateclientIdUsedInScope(scopes: Array<string>): void {
            const clientIdIndex: number = scopes.indexOf(this.clientId);
            if (clientIdIndex >= 0) {
                scopes.splice(clientIdIndex, 1);
                if (scopes.indexOf("openid") === -1) {
                    scopes.push("openid");
                }
                if (scopes.indexOf("profile") === -1) {
                    scopes.push("profile");
                }
            }
        }

        parseScope(scopes: Array<string>): string {
            let scopeList: string = "";
            if (scopes) {
                for (let i = 0; i < scopes.length; ++i) {
                    scopeList += (i !== scopes.length - 1) ? scopes[i] + " " : scopes[i];
                }
            }

            return scopeList;
        }
    }
}