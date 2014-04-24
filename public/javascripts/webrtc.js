(function (global, _) {
    'use strict';

    if (window.webkitRTCPeerConnection) {
        window.RTCPeerConnection = window.webkitRTCPeerConnection;
    } else if (window.mozRTCPeerConnection) {
        window.RTCPeerConnection = window.mozRTCPeerConnection;
        window.RTCSessionDescription = window.mozRTCSessionDescription;
        window.RTCIceCandidate = window.mozRTCIceCandidate;
    } else if (!window.RTCPeerConnection) {
        console.warn("WebRTC not supported.");
        return;
    }

    var r = global.rtcnet = global.rtcnet || {};
    r.WebRTC = function WebRTC(stunServer) {
        _.bindAll(this, "_onRemoteCandidate", "_onLocalDesc", "_onReceiveSignal", "_onError");
        this.on("receiveSignal", this._onReceiveSignal);

        var that = this;
        var configuration = {iceServers: [{url: stunServer}]},
            constraints = {optional: [{DtlsSrtpKeyAgreement: true}]};

        this.channels = {};
        this.connection = new RTCPeerConnection(configuration, constraints);
        this.connection.onicecandidate = function (e) {
            if (e.candidate) {
                console.log("Send candidate signal");
                that.sendSignal({
                    type: "candidate",
                    candidate: e.candidate
                });
            }
        };
        this.connection.onnegotiationneeded = function (e) {
            console.log("onnegotiationneeded");
            that._createOffer();
        };
        this.connection.ondatachannel = function (e) {
            console.log("ondatachannel", e.channel);
            that._initChannel(e.channel);
        };
        this.connection.onclosedconnection = function (e) {
            console.log("onclosedconnection");
            that.trigger("disconnected");
        };
        this.connection.oniceconnectionstatechange = function (e) {
            console.log("oniceconnectionstatechange iceConnectionState:", this.iceConnectionState);
            switch (this.iceConnectionState) {
                case "connected":
                    that.trigger("connected");
                case "failed":
                case "disconnected":
                case "closed":
                    that.trigger("disconnected");
            }
        };
    };
    r.WebRTC.inherits(r.EventBus).props({
        connect: function () {
            this.createChannel("___MAIN___");
            this._createOffer();
        },
        _createOffer: function () {
            console.log("createOffer");
            this.connection._createOffer(this._onLocalDesc, this._onError);
        },
        createChannel: function (label, openCallback) {
            console.log("Create data channel:", label);
            var channel = this.connection.createDataChannel(label, {reliable: true});
            this._initChannel(channel, openCallback);
            return channel;
        },
        _initChannel: function (channel, openCallback) {
            var that = this;
            this.channels[channel.label] = channel;
            channel.on("open", function (e) {
                console.log("Channel opened:", channel.label);
                openCallback && openCallback(channel);
            });
            channel.on("message", function (e) {
                console.log("Channel message:", e.data);
                that.trigger("message", e);
            });
            channel.on("close", function (e) {
                console.log("Channel closed:", channel.label);
                delete that.channels[channel.label];
            });
            channel.on("error", function (e) {
                console.log("Channel error:", e);
            });
        },
        send: function (data) {
            var channel = this.channels["___MAIN___"];
            if (channel) {
                switch (channel.readyState) {
                    case "open":
                        channel.send(data);
                        break;
                    case "connecting":
                        channel.on("open", function () {
                            channel.send(data);
                        });
                        break;
                    default:
                        channel = null;
                }
            }
            if (!channel) {
                this._initChannel("___MAIN___", function (channel) {
                    channel.send(data);
                });
            }
        },
        _onLocalDesc: function (desc) {
            var that = this;
            console.log("setLocalDescription", desc);
            this.connection.setLocalDescription(desc, function() {
                console.log("Send local desc:", desc);
                that.trigger("sendSignal", {type: desc.type, desc: desc});
            }, this._onError);
        },
        _onReceiveSignal: function (signal) {
            switch (signal.type) {
                case "offer":
                case "answer":
                    this._onRemoteDesc(new RTCSessionDescription(signal.desc));
                case "candidate":
                    this._onRemoteCandidate(new RTCIceCandidate(signal.candidate));
            }
        },
        _onRemoteDesc: function (desc) {
            var that = this;
            console.log("setRemoteDescription", desc);
            this.connection.setRemoteDescription(desc, function() {
                if (desc.type == "offer") {
                    console.log("createAnswer");
                    that.connection.createAnswer(that._onLocalDesc, that._onError);
                }
            }, this._onError);
        },
        _onRemoteCandidate: function (candidate) {
            console.log("addIceCandidate", candidate);
            this.connection.addIceCandidate(candidate);
        },
        _onError: function (error) {
            console.error("Connection error:", error);
        },
        close: function () {
            this.connection.close();
        }
    });
})(window, _);