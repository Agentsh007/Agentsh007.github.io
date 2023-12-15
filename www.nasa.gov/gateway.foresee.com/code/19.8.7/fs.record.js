/***************************************
 * @preserve
 * ForeSee Web SDK: record
 * Built April 26, 19 17:52:27
 * Code version: 19.8.7
 * Template version: 19.8.7
 ***************************************/
_fsDefine(["require", "fs", _fsNormalizeUrl("$fs.utils.js"), "recordconfig"], function(e, fs, utils, h) {
    var n = {},
        l = window,
        d = "fs_sessionStarted",
        t = "fs_recorderCanceled",
        u = "fs_recorderStoppedOldBrowser",
        r = "fs_recorderTransmitFailed",
        p = "rpid",
        f = "mid",
        g = "rt",
        m = "cncl",
        v = "SESSION",
        y = "grft",
        _ = "norec",
        b = "rpn";

    function i(e) {
        fs.ext(this, {
            sesh: e,
            siteId: fs.toLowerCase(e.siteId.replace(/[^a-zA-Z0-9]*/g, "")),
            _shouldTransmit: !1,
            _isTransmitting: !1,
            _gotFirstPacket: !1,
            _failedTransmits: 0,
            _prevTimestamp: utils.now()
        }, !1), e.beginTransmitting.subscribe(this._startTransmitting.bind(this), !0, !0), e._storage.StorageFull.subscribe(this._emptyStorage.bind(this), !1, !1)
    }

    function S(e, t, i) {
        this.dom = e, this.tree = t, this.modifier = i, this.roots = new Set, this.checked = new Set
    }
    i.prototype.enqueue = function(e) {
        this.save(e), this._gotFirstPacket = !0, this._transmit()
    }, i.prototype.save = function(e) {
        if (!this.sesh.DONOTRECORD) {
            var t = this.sesh._storage,
                i = t.get("rpls") || [];
            i.push({
                when: this._getMonotonicTimestamp(),
                data: e,
                pn: this.sesh.getPageNum()
            }), t.set("rpls", i), t.commit()
        }
    }, i.prototype.dispose = function() {
        this._shouldTransmit && !this.sesh.DONOTRECORD && this._sendAllWithoutWaiting()
    }, i.prototype._startTransmitting = function() {
        this._shouldTransmit = !0, this._gotFirstPacket && this._transmit()
    }, i.prototype._emptyStorage = function() {
        if (this._shouldTransmit) return this._actuallyTransmit();
        var e = this.sesh._storage,
            t = e.get("rpls") || [];
        if (0 < t.length)
            for (var i = t[0].pn; t[0].pn === i;) t.shift();
        e.set("rpls", t), e.commit()
    }, i.prototype._transmit = function() {
        this._shouldTransmit && this._actuallyTransmit()
    }, i.prototype._sendAllWithoutWaiting = function() {
        var e = this.sesh._storage.get("rpls") || [];
        e.length && utils.sendWithoutWaiting(this._buildUrl(), {
            data: e
        }, !0)
    }, i.prototype._buildUrl = function() {
        return fs.config.recUrl + "rest/web/event/" + fs.enc(n.jrny.customerId) + "/" + fs.enc(this.sesh.getGlobalId()) + "/" + fs.enc(this.sesh.getSessionId()) + "?domain=" + fs.enc(document.domain) + "&site_id=" + fs.enc(this.siteId) + "&version=" + fs.enc("symlink" == fs.config.codeVer ? "19.7.0" : fs.config.codeVer)
    }, i.prototype._actuallyTransmit = function() {
        var i = this.sesh,
            e = this.sesh._storage,
            s = e.get("rpls") || [],
            t = null;
        s.length < 1 || (this._isTransmitting || (this._isTransmitting = !0, t = s.length <= 3 ? {
            data: s
        } : {
            data: s.slice(0, 3)
        }, (new utils.AjaxTransport).send({
            method: "POST",
            contentType: "application/json",
            url: this._buildUrl(),
            data: t,
            failure: function(e, t) {
                this._isTransmitting = !1, n.jrny.addEventString(r), 5 == ~~(t / 100) ? this._failedTransmits = 20 : this._failedTransmits++, 20 < this._failedTransmits && i && i.endSession()
            }.bind(this),
            success: function(t) {
                (t = JSON.parse(t)).ids && (s = (s = e.get("rpls") || []).filter(function(e) {
                    return -1 == t.ids.indexOf(e.when)
                }), e.set("rpls", s), e.commit()), s.length < 1 || !this._shouldTransmit ? this._isTransmitting = !1 : setTimeout(function() {
                    this._isTransmitting = !1, this._actuallyTransmit()
                }.bind(this), 500)
            }.bind(this)
        })))
    }, i.prototype._getMonotonicTimestamp = function() {
        var e = utils.now();
        return e <= this._prevTimestamp && (e = this._prevTimestamp + 1), this._prevTimestamp = e
    }, S.prototype.reset = function() {
        this.roots.clear(), this.checked.clear()
    }, S.prototype.dispose = function() {
        this.reset(), this.dom = null, this.tree = null
    }, S.prototype.addChangedEl = function(e) {
        this.roots.add(e)
    }, S.prototype.checkAll = function() {
        return this.reset(), this.roots.add(this.dom), this.check()
    }, S.prototype.check = function() {
        var i = !0;
        return this.roots.forEach(function(e) {
            var t = this.tree.get(e);
            t && !this._checkEl(e, t) && (i = !1)
        }.bind(this)), i
    }, S.prototype._checkEl = function(e, t) {
        if (this.checked.has(e)) return !0;
        this.checked.add(e);
        var i = !0;
        return this.tree.get(e) !== t && (console.error("Node mismatch", t, e), i = !1), t.t !== e.nodeType && (console.error("Name mismatch at node", t, e), i = !1), t.n && t.n !== e.nodeName && (console.error("Name mismatch at node", t, e), i = !1), t.v && t.v !== e.nodeValue && (console.error("Value mismatch at node", t, e), i = !1), this._syncChildren(e, e.childNodes, t.c) || (i = !1), i
    }, S.prototype._syncChildren = function(e, t, i) {
        for (var s, n, r = !0, o = t.length, a = i.length, c = Math.min(o, a), h = 0, d = o - 1, l = a - 1; h < c && this.tree.get(t[h]) === i[h]; h++) this._checkEl(t[h], i[h]) || (r = !1);
        for (; h <= d && h <= l && this.tree.get(t[d]) === i[l]; d--, l--) this._checkEl(t[d], i[l]) || (r = !1);
        if (l++, ++d <= h && l <= h) return r;
        if (h < d && l <= h) {
            for (; h < d; h++) s = this.tree.add(e, t[h]), this.modifier.add(t[h], s, h);
            return !1
        }
        if (h < l && d <= h) {
            for (; h < l; l--) n = this.tree.idEl.get(i[h].id), s = this.tree.remove(n), this.modifier.remove(n, s);
            return !1
        }
        for (var u = h; u < l; u++) n = this.tree.idEl.get(i[h].id), s = this.tree.remove(n), this.modifier.remove(n, s);
        for (; h < d; h++) s = this.tree.add(e, t[h]), this.modifier.add(t[h], s, h);
        return !1
    };
    var a = function() {
            function e() {
                this.elIndex = new Map, this.idIndex = new Map, this.idEl = new Map, this.root = null, this.nextId = 1
            }
            return e.prototype.scan = function(e) {
                var t, i, s = [],
                    n = {
                        id: 0,
                        p: 0,
                        t: e.nodeType,
                        c: s
                    };
                for (null == this.root && (this.root = n), t = 0, i = e.childNodes.length; t < i; t++) this.get(e.childNodes[t]) || s.push(this.scan(e.childNodes[t]));
                if (this._track(e, n), null != e.nodeValue && (n.v = e.nodeValue), "#" !== e.nodeName[0]) {
                    if (n.n = e.nodeName, e.hasAttributes && e.hasAttributes()) {
                        for (n.a = {}, t = 0, i = e.attributes.length; t < i; t++) {
                            var r = e.attributes[t].name;
                            n.a[r] = e.attributes[t].value, "href" !== r && "src" !== r || !e[r] || "A" === e.nodeName || "AREA" === e.nodeName || "SCRIPT" === e.nodeName || (n.a[r] = e[r])
                        } - 1 < ["INPUT", "SELECT", "TEXTAREA"].indexOf(e.nodeName.toUpperCase()) && (n.a.value = e.value)
                    }
                    10 === e.nodeType && (n.publicId && (n.publicId = e.publicId), n.systemId && (n.systemId = e.systemId))
                }
                for (t = 0, i = s.length; t < i; t++) s[t].p = n.id;
                return n
            }, e.prototype.import = function(e) {
                var t, i;
                for (null == this.root && (this.root = e), t = 0, i = e.c.length; t < i; t++) this.import(e.c[t]);
                return this.idIndex.set(e.id, e), e
            }, e.prototype.add = function(e, t) {
                var i, s, n = this.get(e);
                return s = Array.prototype.indexOf.call(e.childNodes, t), i = this.scan(t), n.c.splice(s, 0, i), i.p = n.id, i
            }, e.prototype.insert = function(e, t) {
                var i = this.getById(t.p);
                return this.import(t), i.c.splice(e, 0, t), t
            }, e.prototype.move = function(e, t, i, s) {
                var n, r = this.get(e),
                    o = this.getById(r.p),
                    a = this.get(t);
                o.c.splice(o.c.indexOf(r), 1), r.p = a.id, i ? s ? a.c.splice(a.c.indexOf(this.get(s)), 0, r) : ((n = a.c.indexOf(this.get(i)) + 1) > a.c.length && (n = a.c.length), n < 0 && (n = 0), a.c.splice(n, 0, r)) : s && this.get(s) === a.c[0] ? a.c.unshift(r) : ((n = a.c.indexOf(this.get(s))) > a.c.length && (n = a.c.length), n < 0 && (n = 0), a.c.splice(n, 0, r))
            }, e.prototype.moveById = function(e, t, i) {
                var s = this.getById(e),
                    n = this.getById(s.p),
                    r = this.getById(t);
                n.c.splice(n.c.indexOf(s), 1), r.c.splice(i, 0, s), s.p = r.id
            }, e.prototype.get = function(e) {
                return this.elIndex.get(e)
            }, e.prototype.getById = function(e) {
                return this.idIndex.get(e)
            }, e.prototype.remove = function(e) {
                var t, i, s = this.get(e);
                for (t = s.c.length - 1; 0 <= t; t--) this.remove(this.idEl.get(s.c[t].id));
                return this.elIndex.delete(e), this.idIndex.delete(s.id), this.idEl.delete(s.id), 0 < s.p && (i = this.getById(s.p)).c.splice(i.c.indexOf(s), 1), s
            }, e.prototype.removeById = function(e) {
                var t, i = this.getById(e),
                    s = this.getById(i.p);
                for (t = i.c.length - 1; 0 <= t; t--) this.removeById(i.c[t].id);
                return this.idIndex.delete(e), s && s.c.splice(s.c.indexOf(i), 1), i
            }, e.prototype._track = function(e, t) {
                var i = this.nextId;
                return this.nextId++, t.id = i, this.elIndex.set(e, t), this.idIndex.set(i, t), this.idEl.set(i, e), i
            }, e.prototype.dispose = function() {
                this.elIndex.clear(), this.idIndex.clear(), this.idEl.clear(), this.nextId = 1, this.root = null
            }, e
        },
        w = a(),
        E = function(t, e, i, s) {
            fs.ext(this, {
                throttleTime: i,
                recFunction: s,
                subject: t,
                lastCap: utils.now()
            }, !1), utils.Bind(t, e, function(e) {
                this._capture && this._capture(e, t)
            }.bind(this))
        };
    E.prototype.merge = function(t, e, i) {
        return utils.Bind(t, e, function(e) {
            this._capture && this._capture(e, t, i)
        }.bind(this)), this
    }, E.prototype._capture = function(e, t, i) {
        var s, n;
        clearTimeout(this.lastCapThrottle), this._eventCopy = fs.ext({}, e, !1), utils.now() - this.lastCap > this.throttleTime ? (this.recFunction(e, t, i), this.lastCap = utils.now()) : (this.capCB = (s = this._eventCopy, n = t, fs.isDefined(s.clientX) && (s.sX = s.clientX, s.sY = s.clientY), function() {
            this.capCB = null, s.delayed = !0, this.recFunction(s, n, i), this.lastCap = utils.now()
        }).bind(this), this.lastCapThrottle = setTimeout(this.capCB, this.throttleTime - (utils.now() - this.lastCap)))
    }, E.prototype.trigger = function() {
        this.capCB && (clearTimeout(this.lastCapThrottle), this.capCB())
    }, E.prototype.dispose = function() {
        clearTimeout(this.lastCapThrottle), fs.dispose(this)
    };

    function c(e, t) {
        fs.ext(this, {
            sesh: e,
            worker: t,
            transmitter: new i(e),
            eventsBuffer: [],
            partialBuffer: [],
            firstPacket: !0,
            _maybeTransmitQueue: utils.debounce(this.transmitQueue.bind(this), 50, 100)
        }, !1)
    }
    c.prototype.receive = function(e) {
        this.partialBuffer = [], this.transmitter.enqueue(e)
    }, c.prototype.receivePartial = function(e) {
        this.partialBuffer = this.partialBuffer.concat(e)
    }, c.prototype.send = function(e) {
        this.eventsBuffer.push(e), this.firstPacket ? (this.firstPacket = !1, this.transmitQueue()) : this._maybeTransmitQueue()
    }, c.prototype.flush = function() {
        this._maybeTransmitQueue.cancel(), this.transmitQueue()
    }, c.prototype.transmitQueue = function() {
        0 < this.eventsBuffer.length && (this.worker.sendEvents(this.eventsBuffer), this.eventsBuffer = [])
    }, c.prototype.emergencySavePartialState = function() {
        if (0 !== this.partialBuffer.length && !this.sesh.DONOTRECORD) {
            var e = utils.Compress.compress(JSON.stringify(this.partialBuffer));
            this.transmitter.save(e)
        }
    };
    c.prototype.dispose = function() {
        this.emergencySavePartialState(), this.transmitter.dispose()
    };
    var I = function(e, t, i, s, n, r, o, a) {
        var c;
        if (fs.ext(this, {
                fr: e,
                config: t,
                masker: i,
                worker: s,
                newInfoScanner: n,
                inputCap: o,
                ctx: r,
                tree: a
            }, !1), "MutationObserver" !== (c = void 0 !== window.__zone_symbol__MutationObserver ? window.__zone_symbol__MutationObserver : "undefined" != typeof WebKitMutationObserver ? WebKitMutationObserver : MutationObserver).name) {
            var h = new c(function() {});
            h.__zone_symbol__originalInstance ? c = h.__zone_symbol__originalInstance.constructor : h._zone$originalInstance && (c = h._zone$originalInstance.constructor)
        }
        this.ob = new c(this._handleMutation.bind(this)), this.ob.observe(e.document.documentElement, {
            childList: !0,
            attributes: !0,
            characterData: !0,
            subtree: !0,
            attributeOldValue: !1
        })
    };
    I.prototype._handleMutation = function(e) {
        var t, i, s, n, r, o, a, c, h, d, l, u = 0,
            p = [],
            f = this.worker,
            g = this.masker,
            m = [],
            v = this.tree,
            y = new Map,
            _ = new Map,
            b = new S(this.fr.document.documentElement, v, {
                add: function(e, t, i) {
                    0,
                    this._addElement(p, m, e, t, i)
                }.bind(this),
                remove: function(e, t) {
                    0,
                    this._removeElement(p, e, t)
                }.bind(this)
            });
        for (d = g.piiObj.noRules ? function() {
                return 0
            } : function(e, t) {
                return e = e || 0, 1 === t.nodeType && "SCRIPT" != t.tagName && "LINK" != t.tagName && "IFRAME" != t.tagName ? e + 1 : e + 0
            }, i = 0; i < e.length; i++)
            if (0 < (t = e[i]).addedNodes.length ? u += Array.prototype.reduce.call(t.addedNodes, d, u) : "attributes" === t.type && "class" === t.attributeName && u++, "childList" === t.type && v.get(t.target)) {
                for (s = 0; s < t.removedNodes.length; s++) v.get(t.removedNodes[s]) && y.set(t.removedNodes[s], t.target);
                for (s = 0; s < t.addedNodes.length; s++) n = t.addedNodes[s], y.has(n) && (_.set(n, (_.get(n) || []).concat({
                    from: y.get(n),
                    to: t.target
                })), y.delete(n))
            }
        for (0 < u && (h = g.updateMaskingTargets()), i = 0; i < e.length; i++)
            if (n = (t = e[i]).target, r = v.get(n), "attributes" == t.type) {
                if (!r) continue;
                if (r.a = r.a || {}, l = n.getAttribute(t.attributeName), "href" !== t.attributeName && "src" !== t.attributeName || !n[t.attributeName] || "A" === n.nodeName || "AREA" === n.nodeName || "SCRIPT" === n.nodeName || (l = n[t.attributeName]), l === r.a[t.attributeName]) continue;
                r.a[t.attributeName] = l, p.push({
                    e: N.ATTR_MODIFIED,
                    d: {
                        ctx: this.ctx,
                        id: r.id,
                        attr: t.attributeName,
                        val: r.a[t.attributeName],
                        tn: r.n,
                        r: r.a.rel || 0
                    }
                })
            } else if ("characterData" == t.type) {
            if (!r) continue;
            r.v = n.nodeValue, p.push({
                e: N.CHAR_DATA,
                d: {
                    ctx: this.ctx,
                    id: r.id,
                    v: n.nodeValue
                }
            })
        } else {
            if ("childList" != t.type) throw new Error("Unknown type: " + t.type);
            for (b.addChangedEl(n), u = 0; u < t.removedNodes.length; u++) o = t.removedNodes[u], _.has(o) && v.get(o) || v.get(o) && (r = this.tree.remove(o), this._removeElement(p, o, r));
            for (u = 0; u < t.addedNodes.length; u++)
                if (o = t.addedNodes[u], a = v.get(o), c = v.get(n))
                    if (a && _.has(o)) {
                        _.has(o) && (_.get(o).shift(), _.get(o).length < 1 && _.delete(o));
                        var w = v.getById(a.p);
                        if (c.id === a.p && Array.prototype.indexOf.call(n, o) === w.c.indexOf(a)) continue;
                        w.c.indexOf(a);
                        v.move(o, n, t.previousSibling, t.nextSibling), p.push({
                            e: N.NODE_MOVED,
                            d: {
                                ctx: this.ctx,
                                id: a.id,
                                p: c.id,
                                idx: c.c.indexOf(a)
                            }
                        })
                    } else {
                        if (a || !this.fr.document.documentElement.contains(o) || !o.parentNode || !v.get(o.parentNode)) continue;
                        a = v.add(o.parentNode, o), c = v.getById(a.p), this._addElement(p, m, o, a, c.c.indexOf(a))
                    }
        }
        b.check(), h && h.hasChanges && I.markTreeMaskingChanges(v, h, this.ctx, p), 0 < p.length && f.queueAction(N.MOD_LIST, p), 0 < m.length && this.newInfoScanner(m)
    }, I.prototype._removeElement = function(e, t, i) {
        this.masker.removeNodeFromMaskingTargets(t), this.inputCap.untrackInputs(t), e.push({
            e: N.NODE_REMOVED,
            d: {
                ctx: this.ctx,
                id: i.id
            }
        })
    }, I.prototype._addElement = function(e, t, i, s, n) {
        e.push({
            e: N.NODE_ADDED,
            d: {
                ctx: this.ctx,
                tree: JSON.parse(JSON.stringify(s)),
                idx: n
            }
        }), 1 === i.nodeType && -1 == t.indexOf(i) && t.push(i)
    }, I.markTreeMaskingChanges = function(e, t, i, s) {
        var n, r, o, a;
        for (n in t)
            for (o = t[n], r = 0; r < o.length; r++)(a = e.get(o[r]))[n] = !0, s.push({
                e: N.NODE_REMOVED,
                d: {
                    ctx: i,
                    id: a.id
                }
            }), s.push({
                e: N.NODE_ADDED,
                d: {
                    ctx: i,
                    tree: JSON.parse(JSON.stringify(a)),
                    idx: e.getById(a.p).c.indexOf(a)
                }
            })
    }, I.prototype.dispose = function() {
        this.ob.disconnect(), this.fr = null, this.newInfoScanner = null
    };
    var T = {
            getParentWindow: function(e) {
                var t = e;
                if (e) {
                    if (e._pw) return e._pw;
                    if (e.ownerDocument && e.ownerDocument.defaultView) return e.ownerDocument.defaultView;
                    for (; e.parentNode || e.document;) {
                        if (e.document) return t._pw = e;
                        e = e.parentNode
                    }
                }
            },
            getDocType: function(e, t) {
                var i, s = "",
                    n = t.doctype,
                    r = t.childNodes,
                    o = 0;
                if (e.isIE && ("CSS1Compat" != t.compatMode || 5 == t.documentMode)) return s;
                if (n) {
                    try {
                        if ((i = (new XMLSerializer).serializeToString(n).toString()) && 0 < i.length) return i
                    } catch (e) {}
                    s = "<!DOCTYPE HTML", n.publicId && (s = s + ' PUBLIC "' + n.publicId + '"'), n.systemId && (s = s + ' SYSTEM "' + n.systemId + '"'), s += ">"
                } else if (r[o].text) {
                    for (; r[o].text && (0 === r[o].text.indexOf("\x3c!--") || 0 === r[o].text.indexOf("<?xml"));) o++;
                    fs.isDefined(r[o].text) && 0 === fs.toLowerCase(r[o].text).indexOf("<!doctype") && (s = r[o].text)
                }
                return s
            },
            getStyle: function(e, t, i) {
                if (!t) return "";
                var s = "",
                    n = t.document.defaultView;
                return n && n.getComputedStyle && n.getComputedStyle(e, "") ? s = n.getComputedStyle(e, "").getPropertyValue(i) : e.currentStyle && (i = i.replace(/\-(\w)/g, function(e, t) {
                    return t.toUpperCase()
                }), s = e.currentStyle[i]), s
            },
            getPosition: function(e, t) {
                for (var i = 0, s = 0, n = T.getStyle; e;) i += e.offsetTop + (parseFloat(n(e, t, "borderTopWidth")) || 0), s += e.offsetLeft + (parseFloat(n(e, t, "borderLeftWidth")) || 0), e = e.offsetParent;
                return {
                    x: s,
                    y: i
                }
            },
            getPositionRelativeToMainView: function(e, t, i) {
                for (var s, n = !1; !n && t;) {
                    n = t.parent == t;
                    var r = T.getPosition(e, t),
                        o = utils.getScroll(t);
                    i && !n && (r.x -= o.x, r.y -= o.y), s ? (s.x += r.x, s.y += r.y) : s = r, e = t.frameElement, t = t.parent
                }
                return s
            },
            getDocSize: function(e) {
                var t = e || window.document,
                    i = t.body,
                    s = t.documentElement,
                    n = Math.max;
                return {
                    width: n(n(i.scrollWidth, s.scrollWidth), n(i.offsetWidth, s.offsetWidth), n(i.clientWidth, s.clientWidth)),
                    height: n(n(i.scrollHeight, s.scrollHeight), n(i.offsetHeight, s.offsetHeight), n(i.clientHeight, s.clientHeight))
                }
            },
            getVisualViewportPosition: function(e) {
                return e.visualViewport ? {
                    left: e.visualViewport.pageLeft,
                    top: e.visualViewport.pageTop,
                    width: e.visualViewport.width,
                    height: e.visualViewport.height
                } : {
                    left: e.pageXOffset,
                    top: e.pageYOffset,
                    width: e.innerWidth,
                    height: e.innerHeight
                }
            },
            getViewportSizePos: function(e) {
                var t = T.getVisualViewportPosition(e),
                    i = T.getDocSize(e.document),
                    s = e.document.documentElement,
                    n = s.clientWidth,
                    r = s.clientHeight;

                function o(e) {
                    return Math.round(1e3 * e) / 1e3
                }
                return {
                    pw: o(i.width),
                    ph: o(i.height),
                    lw: o(n),
                    lh: o(r),
                    vw: o(t.width),
                    vh: o(t.height),
                    vx: o(t.left),
                    vy: o(t.top)
                }
            },
            externalizeStyleCSSTextToInnerHTML: function(e) {
                var t, i, s = !1;
                if (fs.isDefined(h.useCSSText) || ((t = document.createElement("style")).setAttribute("type", "text/css"), h.useCSSText = fs.isDefined(t.styleSheet)), h.useCSSText)
                    for (var n = 0, r = (t = "STYLE" == e.nodeName ? [e] : e.querySelectorAll("style")).length; n < r; n++)(i = t[n]).styleSheet && i.styleSheet.cssText && i.styleSheet.cssText.replace(/\s/gi, "").length != i.innerHTML.replace(/\s/gi, "").length && (i.innerHTML = i.styleSheet.cssText, s = !0);
                return s
            }
        },
        k = function(e, t, i, s) {
            fs.ext(this, {
                rec: i,
                masker: e,
                worker: t,
                tree: s,
                _inputs: new Map,
                _scanValueInterval: setInterval(this._scanInputValues.bind(this), 100)
            }, !1)
        };
    k.prototype.scanForInputs = function(e) {
        var t, i, s = this._inputs,
            n = function(e) {
                return !s.has(e)
            };
        for (t = 0; t < e.length; t++) i = e[t].querySelectorAll("input, textarea, select"), Array.prototype.filter.call(i, n).forEach(this._watchInput.bind(this))
    }, k.prototype._updateKnownValue = function(e, t) {
        var i = this._inputs.get(e);
        return i.oldVal !== t && (i.oldVal = t, !0)
    }, k.prototype._getPreviousValue = function(e) {
        var t = this._inputs.get(e);
        return t && t.oldVal || ""
    }, k.prototype._watchInput = function(e) {
        var t = (e.getAttribute("type") || "").toUpperCase(),
            i = e.tagName;
        this._inputs.set(e, {}), this._serializeInput(e, !0), "TEXTAREA" == i || "INPUT" == i && -1 < "EMAIL,PASSWORD,TEXT,COLOR,DATE,DATETIME-LOCAL,MONTH,NUMBER,RANGE,SEARCH,TEL,TIME,URL,WEEK".indexOf(t) ? (this.rec.bind(e, "focus", function(e) {
            var t = e.target || e.srcElement;
            this._inputs.has(t) && (this.worker.queueAction(N.FOCUS_BLUR, {
                ctx: this.rec.getPath(),
                id: this.tree.get(t).id,
                v: !0
            }), this._serializeInput(t), this._logCaretInfo(t, !0))
        }.bind(this)), this.rec.bind(e, "blur", function(e) {
            var t = e.target || e.srcElement;
            this._inputs.has(t) && (this.worker.queueAction(N.FOCUS_BLUR, {
                ctx: this.rec.getPath(),
                id: this.tree.get(t).id,
                v: !1
            }), this._serializeInput(t))
        }.bind(this)), this.rec.bind(e, "select", function(e) {
            var t = e.target || e.srcElement;
            this._logCaretInfo(t)
        }.bind(this)), this.rec.bind(e, "input", function(e) {
            var t = e.target || e.srcElement;
            if (this._inputs.has(t)) {
                var i = t.value || "",
                    s = this._getPreviousValue(t) || "";
                this.worker.queueAction(N.KEY_PRESS, {
                    ctx: this.rec.getPath(),
                    id: this.tree.get(t).id,
                    v0: s,
                    v1: i
                }), this._updateKnownValue(t, i), this._logElScroll(t)
            }
        }.bind(this)), this.rec.bind(e, "keyup", function(e) {
            var t = e.target || e.srcElement,
                i = utils.getKeyCode(e); - 1 == [16, 91, 18, 27, 17, 93, 18, 20].indexOf(i) && this._logCaretInfo(t)
        }.bind(this))) : "SELECT" == i ? (this.rec.bind(e, "change", function(e) {
            var t = e.target || e.srcElement;
            this._serializeInput(t)
        }.bind(this)), this.rec.bind(e, "blur", function(e) {
            var t = e.target || e.srcElement;
            this._serializeInput(t)
        }.bind(this))) : "INPUT" == i && -1 < "CHECKBOX,RADIO".indexOf(t) && this.rec.bind(e, "change", function(e) {
            var t = e.target || e.srcElement;
            this._serializeInput(t)
        }.bind(this))
    }, k.prototype._serializeInput = function(t, e) {
        var i, s, n, r = (t.getAttribute("type") || "TEXT").toUpperCase(),
            o = t.tagName;
        if (this._inputs.has(t))
            if ("TEXTAREA" === o || "INPUT" == o && -1 == "CHECKBOX,RADIO".indexOf(r)) i = t.value || "", this._updateKnownValue(t, i) && !e && (s = this._getCaretInfo(t), n = {
                ctx: this.rec.getPath(),
                id: this.tree.get(t).id,
                v: i,
                t: r,
                n: o
            }, s && (n.cs = s.s, n.ce = s.e), this.worker.queueAction(N.INPUT_SERIALIZE, n));
            else if ("SELECT" === o) {
            i = t.selectedIndex;
            var a = null !== t.getAttribute("multiple");
            if (a && t.selectedOptions && (i = Array.prototype.map.call(t.selectedOptions, function(e) {
                    return Array.prototype.indexOf.call(t.options, e)
                }), e = !1), this._updateKnownValue(t, "number" == typeof i ? i : i.join(",")) && !e) {
                var c = {
                    ctx: this.rec.getPath(),
                    id: this.tree.get(t).id,
                    t: r,
                    n: o,
                    m: a
                };
                a ? c.so = i : c.s = i, this.worker.queueAction(N.INPUT_SERIALIZE, c)
            }
        } else "INPUT" === o && (i = t.checked, this._updateKnownValue(t, i) && !e && this.worker.queueAction(N.INPUT_SERIALIZE, {
            ctx: this.rec.getPath(),
            id: this.tree.get(t).id,
            ch: i,
            t: r,
            n: o
        }))
    };
    var s = "text|search|password|tel|url".split("|");
    k.prototype._getCaretInfo = function(e) {
        return "input" === e.tagName.toLowerCase() && s.indexOf(e.type.toLowerCase()) < 0 ? null : e && null != e.selectionStart ? {
            s: e.selectionStart,
            e: e.selectionEnd
        } : void 0
    }, k.prototype._logCaretInfo = function(e, t) {
        var i = this._getCaretInfo(e),
            s = this._inputs.get(e);
        if (i && s) {
            var n = s.caret = s.caret || {};
            (t || n.s !== i.s || n.e !== i.e) && (this.worker.queueAction(N.CARET_INFO, {
                ctx: this.rec.getPath(),
                id: this.tree.get(e).id,
                s: i.s,
                e: i.e
            }), n.s = i.s, n.e = i.e, this._logElScroll(e))
        }
    }, k.prototype._logElScroll = function(e) {
        var t = this._inputs.get(e);
        if (t) {
            var i = t.caret = t.caret || {},
                s = Math.round(e.scrollLeft),
                n = Math.round(e.scrollTop);
            i.sx === s && i.sy === n || (i.sx = s, i.sy = n, this.worker.queueAction(N.SCROLL_EL, {
                ctx: this.rec.getPath(),
                id: this.tree.get(e).id,
                x: i.sx,
                y: i.sy
            }))
        }
    }, k.prototype._stopWatchingInput = function(e) {
        utils.Unbind(e), this._inputs.delete(e)
    }, k.prototype._scanInputValues = function() {
        this._inputs.forEach(function(e, t) {
            this._serializeInput(t)
        }.bind(this))
    }, k.prototype.untrackInputs = function(i) {
        this._inputs.forEach(function(e, t) {
            1 === i.nodeType && utils.DOMContains(i, t) && this._stopWatchingInput(t)
        }.bind(this))
    }, k.prototype.dispose = function() {
        this._inputs.forEach(function(e, t) {
            this._stopWatchingInput(t)
        }.bind(this))
    };
    var O = function(e, t, i, s, n, r, o, a, c, h) {
        var d, l, u;
        if (fs.ext(this, {
                config: t,
                masker: r,
                worker: o,
                browser: e,
                rec: a,
                recTop: a.getTop(),
                ctx: c || 0,
                isXDRIFrameMode: i,
                isTop: s,
                fr: n,
                _framesBeingTracked: [],
                isMousedOverPage: !0,
                lastOrientation: {
                    alpha: 0,
                    beta: 0,
                    gamma: 0
                },
                lastSizes: {},
                tree: h || new w
            }, !1), this.tree.scan(n.document.documentElement), this.inputCap = new k(r, o, a, this.tree), I.markTreeMaskingChanges(this.tree, r.getCurrentMaskingTargets(), this.ctx, []), this._serializeDom(), this.mutation = new I(n, t, r, o, function(e) {
                this.inputCap.scanForInputs(e), this.scanForIframes(e)
            }.bind(this), c, this.inputCap, this.tree), this.inputCap.scanForInputs([n.document.body]), s) {
            var p = this._getHiddenKeys();
            this.rec.bind(window, p.visibilityChange, function(e) {
                this.worker.queueAction(N.PAGE_VISIBLE, {
                    ctx: 0,
                    v: !document[p.hidden]
                })
            }.bind(this)), this.rec.bind(a.win.document, "mouseout", function(e) {
                if (this.isMousedOverPage) {
                    var t = e.relatedTarget || e.toElement,
                        i = (this.recTop, this.mouseMoveCapture);
                    !i || t && "HTML" !== t.nodeName || (i.trigger(), this.isMousedOverPage = !1, this.worker.queueAction(N.WINDOW_MOUSEOUT_MOUSEENTER, {
                        ctx: 0,
                        v: !1
                    }))
                }
            }.bind(this)), this.rec.bind(a.win.document, "mouseenter", function(e) {
                this.isMousedOverPage || (this.isMousedOverPage = !0, this.worker.queueAction(N.WINDOW_MOUSEOUT_MOUSEENTER, {
                    ctx: 0,
                    v: !0
                }))
            }.bind(this)), this.sizeCapture = new E(a.win, a.getBindNS() + ":resize", 750, function(e, t) {
                var i = this.rec,
                    s = T.getViewportSizePos(i.win);
                this.lastSizes.lw === s.lw && this.lastSizes.lh === s.lh || (this.worker.queueAction(N.FRAME_SIZE, {
                    ctx: 0,
                    w: s.lw,
                    h: s.lh,
                    vw: s.vw,
                    vh: s.vh
                }), this.lastSizes.lw = s.lw, this.lastSizes.lh = s.lh), this.lastSizes.pw === s.pw && this.lastSizes.ph === s.ph || (this.worker.queueAction(N.DOC_SIZE, {
                    ctx: 0,
                    w: s.pw,
                    h: s.ph
                }), this.lastSizes.pw = s.pw, this.lastSizes.ph = s.ph), this._handleScroll(e, !0)
            }.bind(this))
        }
        for (this.rec.bind(a.win, "error", function(e) {
                if (this.recordedErrors = (this.recordedErrors || 0) + 1, !(50 < this.recordedErrors))
                    if (e.message) this.worker.queueAction(N.JAVASCRIPT_ERROR, {
                        ctx: this.ctx,
                        v: e.message,
                        l: e.lineno,
                        cl: e.colno,
                        s: e.source,
                        st: e.error && e.error.stack
                    });
                    else {
                        var t = e.target;
                        t && this.worker.queueAction(N.ASSET_ERROR, {
                            ctx: this.ctx,
                            tg: this.tree.get(t).id,
                            a: this.tree.get(t).a,
                            ts: e.timeStamp
                        })
                    }
            }.bind(this)), e.isMobile || (u = e.isIE ? a.win.document : a.win, this.mouseMoveCapture = s ? new E(u, this.rec.getBindNS() + ":mousemove", 150, this._handleMouseEvents.bind(this)) : this.recTop.cap.mouseMoveCapture.merge(u, this.rec.getBindNS() + ":mousemove", this, !0), this.rec.bind(a.win.document, "mousedown", function(e) {
                if (this.mouseMoveCapture) {
                    this.mouseMoveCapture.trigger();
                    var t = this.tree.get(e.target),
                        i = this.recTop.cap.lastMousePosition;
                    i && this.worker.queueAction(N.MOUSE_DOWN, {
                        ctx: 0,
                        x: Math.round(i.x),
                        y: Math.round(i.y),
                        id: t && t.id
                    })
                }
            }.bind(this)), this.rec.bind(a.win.document, "mouseup", function(e) {
                this.mouseMoveCapture.trigger();
                var t = this.tree.get(e.target),
                    i = this.recTop.cap.lastMousePosition;
                i && this.worker.queueAction(N.MOUSE_UP, {
                    ctx: 0,
                    x: Math.round(i.x),
                    y: Math.round(i.y),
                    id: t && t.id
                })
            }.bind(this)), this.rec.bind(a.win.document, "click", function(e) {
                this.mouseMoveCapture.trigger();
                var t = this.tree.get(e.target),
                    i = this.recTop.cap.lastMousePosition;
                i && this.worker.queueAction(N.MOUSE_CLICK, {
                    ctx: 0,
                    x: Math.round(i.x),
                    y: Math.round(i.y),
                    id: t && t.id
                })
            }.bind(this))), d = ["start", "end", "cancel", "leave", "move"], l = 0; l < d.length; l++) this.rec.bind(a.win.document, "touch" + d[l], function(t) {
            return function(e) {
                this._handleTouchEvents(e, t)
            }
        }(d[l]).bind(this), {
            passive: !0
        });
        if (s) {
            var f = function(e) {
                var t = this.rec,
                    i = !1,
                    s = T.getViewportSizePos(t.win); - 90 <= t.win.orientation && t.win.orientation <= 90 && (i = !0), this.worker.queueAction(N.ORIENTATION_CHANGE, {
                    ctx: 0,
                    x: s.vx,
                    y: s.vy,
                    isL: i,
                    lw: s.lw,
                    lh: s.lh,
                    pw: s.pw,
                    ph: s.ph,
                    vw: s.vw,
                    vh: s.vh
                }), this.lastSizes.vw = s.vw, this.lastSizes.vh = s.vh, this.lastSizes.lw = s.lw, this.lastSizes.lh = s.lh
            }.bind(this);
            this.rec.bind(this.rec.win, "orientationchange", f)
        }
        s && window.visualViewport && (this.rec.bind(window.visualViewport, "resize", this._handleScroll.bind(this)), this.rec.bind(window.visualViewport, "scroll", this._handleScroll.bind(this))), this.rec.bind(n, "scroll", this._handleScroll.bind(this)), this.scanForIframes([n.document.body])
    };
    O.prototype._getHiddenKeys = function() {
        return void 0 !== document.hidden ? (hidden = "hidden", visibilityChange = "visibilitychange") : void 0 !== document.msHidden ? (hidden = "msHidden", visibilityChange = "msvisibilitychange") : void 0 !== document.webkitHidden && (hidden = "webkitHidden", visibilityChange = "webkitvisibilitychange"), {
            hidden: hidden,
            visibilityChange: visibilityChange
        }
    }, O.prototype._serializeDom = function() {
        var e = this.fr.document,
            t = this.config,
            i = this.browser.browser,
            s = utils.getScreenResolution(),
            n = T.getViewportSizePos(this.fr),
            r = this.fr.location.href.toString(),
            o = this._getHiddenKeys(),
            a = !1;
        this.lastSizes = n, -90 <= this.fr.orientation && this.fr.orientation <= 90 && (a = !0), this.worker.queueAction(N.PAGE_MARKER, {
            ctx: this.ctx,
            parent: this.rec.recordParent ? this.rec.recordParent.instancePath : this.ctx,
            dt: T.getDocType(this.browser, e),
            doc: JSON.parse(JSON.stringify(this.tree.get(e.documentElement))),
            url: r,
            v: this.browser.agent,
            start: fs.startTS,
            tz: (new Date).getTimezoneOffset(),
            domloadtime: utils.now() - fs.startTS,
            cid: t.clientId,
            customerId: fs.config.customerId,
            userId: this.recTop.stg.uid,
            f: document.referrer.toString(),
            t: this.fr.document.title,
            bn: i.name,
            bv: i.version,
            dw: s.w,
            dh: s.h,
            pw: n.pw,
            ph: n.ph,
            lw: n.lw,
            lh: n.lh,
            vw: n.vw,
            vh: n.vh,
            landscape: a,
            mobile: this.browser.isMobile,
            whiteListMode: this.masker.piiObj.useWhiteListing,
            sid: this.rec.getSessionId(),
            gid: this.rec.getGlobalId(),
            vs: !document[o.hidden],
            scroll: {
                x: n.vx,
                y: n.vy
            }
        })
    }, O.prototype._handleScroll = function(e, t) {
        if (this.rec) {
            var i, s, n, r = e.target,
                o = {
                    x: r.scrollLeft,
                    y: r.scrollTop
                },
                a = this.rec.win,
                c = this.recTop;
            r === a.document || r === a.visualViewport || t ? (n = T.getViewportSizePos(a), a !== a.top || this.lastSizes.vw === n.vw && this.lastSizes.vh === n.vh || (this.worker.queueAction(N.ZOOM, {
                ctx: 0,
                vw: n.vw,
                vh: n.vh,
                lw: n.lw,
                lh: n.lh
            }), this.lastSizes.vw = n.vw, this.lastSizes.vh = n.vh), this.lastSizes.vx === n.vx && this.lastSizes.vy === n.vy || (this.worker.queueAction(N.FRAME_SCROLL, {
                ctx: this.rec.getPath(),
                x: n.vx,
                y: n.vy
            }), this.lastSizes.vx = n.vx, this.lastSizes.vy = n.vy), c.cap && this.isMousedOverPage && (i = c.cap._lastUnscrolledMouse, lastMouse = c.cap.lastMousePosition, i && (s = utils.getScroll(c.win), i.x + s.x === lastMouse.x && i.y + s.y === lastMouse.y || this.worker.queueAction(N.MOUSE_MOVE, {
                ctx: 0,
                x: Math.round(i.x + s.x),
                y: Math.round(i.y + s.y)
            })))) : this.worker.queueAction(N.SCROLL_EL, {
                ctx: this.rec.getPath(),
                id: this.tree.get(r).id,
                x: Math.round(o.x),
                y: Math.round(o.y)
            })
        }
    }, O.prototype._handleTouchEvents = function(e, t) {
        if (this.rec) {
            var i, s, n, r = [];
            if (fs.isDefined(e.touches))
                for (i = 0; i < e.touches.length; i++) {
                    s = e.touches[i], n = this.tree.get(s.target);
                    var o = Math.round(s.pageX),
                        a = Math.round(s.pageY);
                    if (this.recTop !== this.rec) {
                        var c = this.rec.win.frameElement,
                            h = T.getPositionRelativeToMainView(c, T.getParentWindow(c), !1),
                            d = utils.getScroll(this.rec.win);
                        h && (o += h.x - d.x, a += h.y - d.y)
                    }
                    r.push({
                        n: s.identifier,
                        x: o,
                        y: a,
                        id: n && n.id
                    })
                }
            this.worker.queueAction(N.TOUCH, {
                ctx: 0,
                ts: r,
                et: t
            }), ("end" === t || 1 < r.length) && this._handleScroll(e, !0)
        }
    }, O.prototype._handleMouseEvents = function(e, t, i) {
        if (this.isMousedOverPage && e) {
            var s = {
                    x: void 0 !== e.clientX ? e.clientX : void 0 !== e.screenX ? e.screenX : e.sX,
                    y: void 0 !== e.clientY ? e.clientY : void 0 !== e.screenY ? e.screenY : e.sY
                },
                n = i ? i.rec : this.rec;
            if (n) {
                var r = utils.getScroll(n.win),
                    o = {
                        x: r.x + s.x,
                        y: r.y + s.y
                    };
                if (this._lastUnscrolledMouse = s, i)
                    if (i.isXDRIFrameMode) o.x += n.ifrFrameOffset.x - r.x, o.y += n.ifrFrameOffset.y - r.y;
                    else {
                        var a = n.win.frameElement,
                            c = T.getPositionRelativeToMainView(a, T.getParentWindow(a), !1),
                            h = utils.getScroll(this.recTop.win);
                        c && (o.x += c.x - r.x, o.y += c.y - r.y), this._lastUnscrolledMouse = fs.ext({}, o), this._lastUnscrolledMouse.x -= h.x, this._lastUnscrolledMouse.y -= h.y
                    }
                this.recTop.cap.lastMousePosition && o.x === this.recTop.cap.lastMousePosition.x && o.y === this.recTop.cap.lastMousePosition.y || (this.recTop.cap.lastMousePosition = o, this.worker.queueAction(N.MOUSE_MOVE, {
                    ctx: 0,
                    x: Math.round(o.x),
                    y: Math.round(o.y)
                }))
            }
        }
    }, O.prototype.getFrameWindow = function(e) {
        var t;
        return e && e.contentWindow ? t = e.contentWindow : e && e.contentDocument && e.contentDocument.defaultView && (t = e.contentDocument.defaultView), t && t != t.top ? t : null
    }, O.prototype.testFrameOrigin = function(e, t) {
        if (e.getAttribute("srcdoc") && !e.getAttribute("src")) return !0;
        var i = e.getAttribute("src");
        if (!i) return !1;
        var s, n = ["javascript:", "about:blank"];
        for (s = 0; s < n.length; s++)
            if (-1 < i.indexOf(n[s])) return !1;
        if (!i || 0 === i.indexOf(" ")) return !1;
        var r = e.src;
        if (!utils.testSameDomain(t || window.location.href, r)) return !1;
        try {
            var o = this.getFrameWindow(e);
            o.__test = !0, delete o.__test
        } catch (e) {
            return !1
        }
        return !0
    }, O.prototype.bindToFrame = function(e, t) {
        var i;
        t.__fsrec__ = i = new R(this.rec.stg, this.rec.browser, t, this.tree.get(e).id, this.rec, this.rec.config, this.tree, this.rec.isIframeMode), this.rec.bind(t, "unload", function() {
            fs.nextTick(function() {
                i.dispose(), delete t.__fsrec__, this._framesBeingTracked.splice(this._framesBeingTracked.indexOf(e), 1), this.scanForIframes([e.parentNode])
            }.bind(this))
        }.bind(this), !0)
    }, O.prototype.scanForIframes = function(e) {
        var t, i, s, n, r, o = this._framesBeingTracked;
        for (i = 0; i < e.length; i++)
            if (0 < (t = e[i].querySelectorAll("iframe")).length)
                for (r = Array.prototype.filter.call(t, function(e) {
                        return -1 == o.indexOf(e)
                    }), s = 0; s < r.length; s++) o.push(r[s]), n = this.getFrameWindow(r[s]), this.testFrameOrigin(r[s]) && !n.__fsrec__ && ("complete" === n.document.readyState || "interactive" === n.document.readyState ? fs.nextTick(function(e, t) {
                    return function() {
                        this.bindToFrame(e, t)
                    }
                }(r[s], n).bind(this)) : utils.BindOnce(n, this.rec.getBindNS() + ":load", function(e, t) {
                    return function() {
                        this.bindToFrame(e, t)
                    }
                }(r[s], n).bind(this)))
    }, O.prototype.dispose = function() {
        this.mutation && this.mutation.dispose(), this.mouseMoveCapture && this.recTop === this.rec && this.mouseMoveCapture.dispose(), this.orientationCapture && this.orientationCapture.dispose(), this.sizeCapture && this.sizeCapture.dispose(), this.inputCap && this.inputCap.dispose();
        var e = this.tree.get(this.fr.document.documentElement);
        e && (this.tree.remove(this.fr.document.documentElement), this.worker.queueAction(N.MOD_LIST, [{
            e: N.NODE_REMOVED,
            d: {
                ctx: this.ctx,
                id: e.id
            }
        }]))
    };
    var x = {
            INIT: "INIT",
            DISPOSE: "DISPOSE",
            EVENTS: "EVENTS",
            WRAPUP: "WRAPUP",
            UNCORK: "UNCORK"
        },
        M = function(e, t, i, s) {
            fs.ext(this, {
                config: e,
                sesh: t,
                stg: i,
                mule: new c(t, this),
                _lastEventTime: fs.startTS
            }, !1);
            var n = ["(" + function(s) {
                    var n = this;
                    n.fs = {
                        ext: s.fsExt
                    }, n.utils = {}, n.utils.Zlib = s.zlib(), n.utils.debounce = s.debounce, n.utils.now = s.now, n.Compress = s.Compress;
                    var r = function() {};
                    r.handleMessage = function(e) {
                        if (e.data && e.data.messageType) switch (e.data.messageType) {
                            case "INIT":
                                var t = new(s.___domtree()),
                                    i = new(s.___treecensor())(t, s.pii);
                                n.logger = new(s.___log())(n.fs, n.Compress, s.___diff(), t, i, s.EVENT_TYPES, r.handlePayloadReady.bind(r), r.handlePartial.bind(r));
                                break;
                            case "DISPOSE":
                                r.dispose();
                                break;
                            case "EVENTS":
                                n.logger.addEvents(e.data.data);
                                break;
                            case "WRAPUP":
                                n.logger.wrapup();
                                break;
                            case "UNCORK":
                                n.logger.uncork()
                        }
                    }, r._sendMessage = function(e, t) {
                        postMessage({
                            messageType: e,
                            data: t || ("PAYLOAD" === e ? "" : {})
                        })
                    }, r.handlePayloadReady = function(e) {
                        r._sendMessage("PAYLOAD", e)
                    }, r.handlePartial = function(e) {
                        r._sendMessage("PARTIAL", e)
                    }, r.dispose = function() {}, n.onmessage = r.handleMessage
                }.toString() + ")", "({zlib: " + utils.__zlib.toString(), ", Compress: " + this._funcObjToString(utils.Compress), ", fsExt: " + fs.ext.toString(), ", ___domtree: " + a.toString(), ", ___log: " + function() {
                    var e = function(fs, Compress, e, t, i, s, n, r) {
                        fs.ext(this, {
                            Differ: e,
                            Compress: Compress,
                            tree: t,
                            censor: i,
                            log: [],
                            types: s,
                            payloadReady: n || function() {},
                            partial: r || function() {},
                            dataSizeGoal: 102400,
                            firstPacket: !0,
                            corked: !0,
                            dataSize: 0
                        }, !1)
                    };
                    return e.prototype.checkChecksum = function(e, t, i) {}, e.prototype.uncork = function() {
                        this.corked = !1, this.firstPacket && 0 === this.log.length && (this.uncorkedRecently = !0), this.pinch()
                    }, e.prototype.wrapup = function() {
                        this.corked || this.pinch()
                    }, e.prototype.addEvents = function(e) {
                        var i, s = this.tree,
                            n = this.censor;
                        e.forEach(function(e) {
                            if (e.d)
                                if (e.e == this.types.PAGE_MARKER && e.d.doc) i = s.import(e.d.doc), n.clean(i), n.censor(i), e.d.doc = JSON.parse(JSON.stringify(i));
                                else if (e.e == this.types.MOD_LIST) e.d.forEach(function(e) {
                                switch (e.e) {
                                    case this.types.ATTR_MODIFIED:
                                        (i = s.getById(e.d.id)).a = i.a || {}, i.a[e.d.attr] = e.d.val, n.clean(i), e.d.val = i.a[e.d.attr];
                                        break;
                                    case this.types.CHAR_DATA:
                                        (i = s.getById(e.d.id)).v = e.d.v, n.censor(i), e.d.v = i.v;
                                        break;
                                    case this.types.NODE_REMOVED:
                                        s.removeById(e.d.id), this.checkChecksum("removing node", s, e.d.s);
                                        break;
                                    case this.types.NODE_ADDED:
                                        s.insert(e.d.idx, e.d.tree), n.clean(e.d.tree), n.censor(e.d.tree), e.d.tree = JSON.parse(JSON.stringify(e.d.tree)), this.checkChecksum("adding node", s, e.d.s);
                                        break;
                                    case this.types.NODE_MOVED:
                                        s.moveById(e.d.id, e.d.p, e.d.idx), n.clean(s.getById(e.d.id)), n.censor(s.getById(e.d.id)), this.checkChecksum("moving node", s, e.d.s)
                                }
                            }.bind(this));
                            else if (e.e === this.types.KEY_PRESS) {
                                var t = this.Differ(e.d.v0, e.d.v1);
                                i = s.getById(e.d.id), delete e.d.v0, delete e.d.v1, t && (i.whitelist || (t.v = this.censor.maskString(t.v)), e.d.s = t.s, e.d.e = t.e, e.d.v = t.v)
                            } else e.e === this.types.INPUT_SERIALIZE && e.d.v && ((i = s.getById(e.d.id)).whitelist || (e.d.v = this.censor.maskString(e.d.v)))
                        }.bind(this)), this.partial(e), this.log = this.log.concat(e), this.dataSize += JSON.stringify(e).length, (1048576 <= this.dataSize || !this.corked && this.dataSize >= this.dataSizeGoal || this.uncorkedRecently) && (this.uncorkedRecently = !1, this.pinch())
                    }, e.prototype.pinch = function() {
                        if (0 < this.log.length) {
                            var e = this.Compress.compress(JSON.stringify(this.log));
                            if (!this.firstPacket) {
                                var t = e.length / this.dataSize;
                                this.dataSizeGoal = Math.floor(51200 / t)
                            }
                            this.firstPacket = !1, this.payloadReady(e), this.log = [], this.dataSize = 0
                        }
                    }, e
                }.toString(), ", ___diff: " + function() {
                    return function(e, t) {
                        if ("string" != typeof e || 0 === e.length) return {
                            s: 0,
                            v: t,
                            e: 0
                        };
                        if ("string" != typeof t || 0 === t.length) return {
                            s: 0,
                            v: "",
                            e: 0
                        };
                        if (e === t) return null;
                        var i, s, n, r = {},
                            o = Math.min(e.length, t.length);
                        for (n = 0; n < o; n++) {
                            if (e.charCodeAt(n) !== t.charCodeAt(n)) {
                                r.s = n;
                                break
                            }
                            n === o - 1 && (r.s = o)
                        }
                        for (o = e.length, i = t.length, s = Math.min(o - r.s, i - r.s), n = 0; n < s; n++)
                            if (e.charCodeAt(o - n - 1) !== t.charCodeAt(i - n - 1)) return r.e = n, r.v = t.substr(r.s, i - n - r.s), r;
                        return r.e = 0, r.v = t.substr(r.s, i - r.s), r
                    }
                }.toString(), ", ___treecensor: " + function() {
                    var t = {
                            alphabetL: "abcdefghijklmnopqrstuvwxyz",
                            alphabetU: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
                            numbers: "0123456789"
                        },
                        e = function(e, t) {
                            this.tree = e, this.pii = t || {
                                noRules: !0
                            }
                        };
                    return e.prototype._removeAttr = function(e, t) {
                        e.a && delete e.a[t]
                    }, e.prototype.clean = function(e) {
                        if ("SCRIPT" == e.n && (this._removeAttr(e, "src"), this._blankTreeText(e)), !e.a || "INPUT" != e.n && "TEXTAREA" != e.n && "SELECT" != e.n || (1 == e.a.fsrVisible ? e.whitelist = !0 : e.whitelist || (void 0 !== e.v && null != e.v && (e.v = this.maskString(e.v)), void 0 !== e.a.value && null != e.a.value && (e.a.value = this.maskString(e.a.value)), e.c && 0 < e.c.length && this._maskTree(e)), delete e.a.fsrVisible), e.a)
                            for (var t in e.a) 2 < t.length && "on" == t.substr(0, 2) && delete e.a[t];
                        e.c && 0 < e.c.length && e.c.forEach(function(e) {
                            this.clean(e)
                        }.bind(this))
                    }, e.prototype.maskString = function(e) {
                        return e.replace(/[^.,!?@#$%\(\)\\\/:\s-]/g, function(e) {
                            return -1 < t.numbers.indexOf(e) ? t.numbers.substr(Math.round(Math.random() * (t.numbers.length - 1)), 1) : e == e.toUpperCase() ? t.alphabetU.substr(Math.round(Math.random() * (t.alphabetU.length - 1)), 1) : t.alphabetL.substr(Math.round(Math.random() * (t.alphabetL.length - 1)), 1)
                        })
                    }, e.prototype._maskTree = function(e) {
                        e.unmasked || e.whitelist || "STYLE" === e.n || (void 0 !== e.v && null != e.v && (e.v = this.maskString(e.v)), e.c && 0 < e.c.length && e.c.forEach(function(e) {
                            this._maskTree(e)
                        }.bind(this)))
                    }, e.prototype._blankTreeText = function(e) {
                        void 0 !== e.v && null != e.v && (e.v = ""), e.c && 0 < e.c.length && e.c.forEach(function(e) {
                            this._blankTreeText(e)
                        }.bind(this))
                    }, e.prototype._parentScan = function(e, t) {
                        for (; 0 < e.p;)
                            if ((e = this.tree.getById(e.p))[t]) return !0
                    }, e.prototype.censor = function(e) {
                        var t = this.pii;
                        t.useWhiteListing ? t.noRules ? this._maskTree(e) : e.unmasked || this._parentScan(e, "unmasked") || this._maskTree(e) : t.noRules || (e.masked || this._parentScan(e, "masked")) && this._maskTree(e), e.c && 0 < e.c.length && e.c.forEach(function(e) {
                            this.censor(e)
                        }.bind(this))
                    }, e
                }.toString(), ", debounce: " + utils.debounce.toString(), ", now: " + utils.now.toString(), ", WORKER_MESSAGE_TYPES: " + JSON.stringify(x), ", EVENT_TYPES: " + JSON.stringify(N), ", pii: " + JSON.stringify(s && s.piiObj), "})"],
                r = new Blob(n, {
                    type: "application/javascript"
                }),
                o = (window.mozURL || window.msURL || window.webkitURL || window.URL).createObjectURL(r);
            this.wrkr = new Worker(o), this.wrkr.__zone_symbol__addEventListener ? this.wrkr.__zone_symbol__addEventListener("message", this._handleMessage.bind(this), !0) : this.wrkr.addEventListener("message", this._handleMessage.bind(this), !0), this._sendMessage(x.INIT, {}), t.beginTransmitting.subscribe(this._uncorkWorker.bind(this), !0, !0)
        };
    M.prototype._funcObjToString = function(e) {
        var t, i = "{";
        for (t in e) i += '"' + t + '":' + (fs.isObject(e[t]) && null != e[t] ? this._funcObjToString(e[t]) : fs.isFunction(e[t]) ? e[t].toString().replace(/\[native code\]/g, "") : JSON.stringify(e[t])) + ",";
        return i + "}"
    }, M.prototype._handleMessage = function(e) {
        if (e.data && e.data.messageType && null != e.data.data && !this._disposed) {
            var t = e.data;
            switch (t.messageType) {
                case "PAYLOAD":
                    if ("" === t.data) return void this.sesh.endSession();
                    this.mule.receive(t.data);
                    break;
                case "PARTIAL":
                    this.mule.receivePartial(t.data)
            }
        }
    }, M.prototype._sendMessage = function(e, t) {
        this.wrkr.postMessage({
            messageType: e,
            data: t || {}
        })
    }, M.prototype._uncorkWorker = function() {
        this._sendMessage(x.UNCORK), this.flush()
    }, M.prototype.sendEvents = function(e) {
        0 < e.length && !this._disposed && this._sendMessage(x.EVENTS, e)
    }, M.prototype.flush = function() {
        !this._disposed && this.wrkr && (this.mule.flush(), this.wrkr.postMessage({
            messageType: x.WRAPUP
        }))
    }, M.prototype.queueAction = function(e, t, i) {
        return i = i || utils.now(), this.mule.send({
            e: e,
            td: i - this._lastEventTime,
            d: t
        }), this._lastEventTime = i
    }, M.prototype.dispose = function() {
        this._disposed = !0, this.mule.dispose(), this._sendMessage(x.DISPOSE), this.wrkr.terminate()
    };
    var C = function(e, t) {
        fs.ext(this, {
            config: t,
            stg: e,
            beginTransmitting: new utils.FSEvent,
            endSessionEvent: new utils.FSEvent,
            siteId: t.clientId || "unk"
        }, !1);
        var i = e.get([f, g, m, "pv", _]),
            s = i[f],
            n = i[g] || !1,
            r = utils.now();
        if (!0 !== i[_]) {
            s || (s = this._generateSID());
            var o, a = this._backup_storage = new utils.DomStorage(this.siteId, !1, !1);
            if ((o = t.advancedSettings.useSessionStorage ? this._storage = new utils.SeshStorage(this.siteId, !1) : this._storage = new utils.WindowStorage(this.siteId)).isNew() && !a.isNew()) o.set(v, a.get(v)), o.setBlob(a.getBlob());
            else if (!o.isNew() && a.isNew()) {
                var c = o.get(v);
                c && (s = c[f]), o.setBlob(o.getBlob())
            }
            var h = o.get(v),
                d = !1;
            ("m" !== s[0] || h && "m" !== h[p][0]) && (d = !0);
            var l = parseInt(e.get(y));
            if ((!isNaN(l) || d) && (36e5 < r - l || d) && (s = this._generateSID(), h = null, n = !1, o.eraseAll(), e.erase(f), fs.supportsDomStorage)) try {
                localStorage.removeItem(g), localStorage.removeItem(_)
            } catch (e) {}
            h ? (n = h[g], h[b] = (h[b] || 0) + 1) : (n = !(h = {}), h[p] = this._generateSID(), h[f] = s, h[g] = n, h[b] = 0), e.set(g, n), e.set(f, s), e.set(y, r), o.set(v, h), this.sessionInfo = h, o.commit(), a && utils.Bind(window, "beforeunload", function() {
                a.set(v, o.get(v)), a.commit()
            }.bind(this)), n ? this.beginTransmitting.fire() : this._stateCheckInterval = setInterval(this._checkTransmittingState.bind(this), 5e3)
        } else this.DONOTRECORD = !0
    };
    C.prototype._generateSID = function() {
        return "m" + utils.generateGUID().substr(1)
    }, C.prototype._checkTransmittingState = function() {
        var e = !1;
        if (fs.supportsDomStorage) try {
            e = "yes" == localStorage.getItem(g)
        } catch (e) {}
        e || (e = this.isTransmitting()), e && (clearInterval(this._stateCheckInterval), this.beginTransmitting.fire())
    }, C.prototype.isTransmitting = function() {
        return !!this.sessionInfo[g]
    }, C.prototype.getPageNum = function() {
        var e = this._storage.get(v);
        return e && e[b] || 0
    }, C.prototype.setTransmitting = function() {
        if (fs.supportsDomStorage) try {
            localStorage.setItem(g, "yes")
        } catch (e) {}
        clearInterval(this._stateCheckInterval), this.stg.set(g, !0), this.sessionInfo[g] = !0, this._storage.set(v, this.sessionInfo), this._storage.commit(), this.beginTransmitting.fire()
    }, C.prototype.clear = function() {
        var e = this.stg;
        if (clearInterval(this._stateCheckInterval), e.erase(g), e.erase(f), e.erase(y), fs.supportsDomStorage) try {
            localStorage.removeItem(g), localStorage.removeItem(_)
        } catch (e) {}
        this._storage.eraseAll(), this._backup_storage.eraseAll(), this.DONOTRECORD = !0
    }, C.prototype.endSession = function() {
        if (this.clear(), this.stg.set(_, !0, 36e5), fs.supportsDomStorage) try {
            localStorage.setItem(_, "yes")
        } catch (e) {}
        this.endSessionEvent.fire()
    }, C.prototype.getGlobalId = function() {
        return this.sessionInfo[f]
    }, C.prototype.getSessionId = function() {
        return this.sessionInfo[p]
    }, C.prototype.dispose = function() {
        clearInterval(this._stateCheckInterval)
    };
    var A = function(e, t) {
        this.win = t, this.doc = t.document, this.piiObj = this._prepPIIObjectForPage(e, t), this.maskEls = {
            whiteList: [],
            block: [],
            obscure: [],
            ignore: [],
            inputWhiteList: [],
            useWhiteListing: !0
        }
    };
    A.prototype._prepPIIObjectForPage = function(e, t) {
        var i, s = JSON.parse(JSON.stringify(e)),
            n = fs.toLowerCase(fs.getParam("fsrurl") || t.location.href || "about:blank"),
            r = !0,
            o = !1;
        for (s.staticBlockEls && (s.selectiveMaskZones = fs.ext(s.selectiveMaskZones || {}, s.staticBlockEls), delete s.staticBlockEls, o = !0), s.dynamicBlockEls && (s.selectiveMaskZones = fs.ext(s.selectiveMaskZones || {}, s.dynamicBlockEls), delete s.dynamicBlockEls, o = !0), s.selectiveMaskZones = s.selectiveMaskZones || {}, s.staticVisibleEls && (s.selectiveUnMaskZones = fs.ext(s.selectiveUnMaskZones || {}, s.staticVisibleEls), s.visibleInputs = fs.ext(s.visibleInputs || {}, s.staticVisibleEls), delete s.staticVisibleEls, o = !0), s.dynamicVisibleEls && (s.selectiveUnMaskZones = fs.ext(s.selectiveUnMaskZones || {}, s.dynamicVisibleEls), s.visibleInputs = fs.ext(s.visibleInputs || {}, s.dynamicVisibleEls), delete s.dynamicVisibleEls, o = !0), s.staticWhiteListEls && (s.selectiveUnMaskZones = fs.ext(s.selectiveUnMaskZones || {}, s.staticWhiteListEls), s.visibleInputs = fs.ext(s.visibleInputs || {}, s.staticWhiteListEls), delete s.staticWhiteListEls, o = !0), s.dynamicWhiteListEls && (s.selectiveUnMaskZones = fs.ext(s.selectiveUnMaskZones || {}, s.dynamicWhiteListEls), s.visibleInputs = fs.ext(s.visibleInputs || {}, s.dynamicWhiteListEls), delete s.dynamicWhiteListEls, o = !0), s.selectiveUnMaskZones = s.selectiveUnMaskZones || {}, s.removeVisibilityEls && (s.redactZones = fs.ext(s.redactZones || {}, s.removeVisibilityEls), delete s.removeVisibilityEls, o = !0), s.obscureEls && (s.redactZones = fs.ext(s.redactZones || {}, s.obscureEls), delete s.obscureEls, o = !0), s.assetBlockEls && (s.redactZones = fs.ext(s.redactZones || {}, s.assetBlockEls), delete s.assetBlockEls, o = !0), s.redactZones = s.redactZones || {}, null == s.pagesToSelectiveMask && (s.pagesToSelectiveMask = [], o && 0 === Object.keys(s.selectiveUnMaskZones).length && (s.pagesToSelectiveMask = Object.keys(s.selectiveMaskZones))), o && console.warn("sr: upgraded config to: pii:", JSON.stringify(s, null, 2), "\n(to make this message disappear, please upgrade to new record config format)"), i = 0; i < s.pagesToSelectiveMask.length; i++)
            if (utils.testAgainstSearch(s.pagesToSelectiveMask[i], n)) {
                r = !1;
                break
            }
        function a(e, t, i) {
            var s, n = e[t],
                r = Object.keys(n || {}),
                o = [];
            for (s = 0; s < r.length; s++) utils.testAgainstSearch(r[s] || "*", i) ? o.push(n[r[s]]) : delete n[r[s]];
            return e[t] = o.join(",").trim(), 0 == o.length && (delete e[t], !0)
        }
        return s.useWhiteListing = r, delete s.pagesToSelectiveMask, r ? (delete s.selectiveMaskZones, s.noRules = a(s, "selectiveUnMaskZones", n)) : (s.noRules = a(s, "selectiveMaskZones", n), delete s.selectiveUnMaskZones), a(s, "visibleInputs", n), a(s, "redactZones", n), s
    }, A.prototype.removeNodeFromMaskingTargets = function(e) {
        var t, i = this.piiObj,
            s = this.maskEls,
            n = s.whiteList,
            r = s.block,
            o = (s.obscure, s.inputWhiteList);
        if (i.useWhiteListing && 0 < n.length)
            for (t = n.length - 1; 0 <= t; t--)(e === n[t] || 1 === e.nodeType && utils.DOMContains(e, n[t])) && n.splice(t, 1);
        else if (!i.useWhiteListing && 0 < r.length)
            for (t = r.length - 1; 0 <= t; t--)(e === r[t] || 1 === e.nodeType && utils.DOMContains(e, r[t])) && r.splice(t, 1);
        for (t = o.length - 1; 0 <= t; t--)(e === o[t] || 1 === e.nodeType && utils.DOMContains(e, o[t])) && o.splice(t, 1)
    }, A.prototype.getCurrentMaskingTargets = function() {
        var e = this.maskEls;
        return {
            unmasked: e.whiteList,
            masked: e.block,
            whitelist: e.inputWhiteList,
            redact: e.obscure
        }
    }, A.prototype.updateMaskingTargets = function() {
        var e, t, i, s, n, r, o, a = this.piiObj,
            c = this.doc,
            h = this.maskEls,
            d = h.whiteList,
            l = h.block,
            u = h.obscure,
            p = h.ignore,
            f = h.inputWhiteList,
            g = !1,
            m = {
                unmasked: [],
                masked: [],
                whitelist: [],
                redact: []
            };
        if (!a.noRules)
            if (a.useWhiteListing) {
                if (a.selectiveUnMaskZones && (e = c.querySelectorAll(a.selectiveUnMaskZones), 0 < (t = Array.prototype.filter.call(e, function(e) {
                        return -1 == d.indexOf(e) && -1 == p.indexOf(e)
                    })).length))
                    for (n = 0, i = t.length; n < i; n++) {
                        for (s = t[n], o = !1, r = d.length - 1; 0 <= r; r--)
                            if (1 === d[r].nodeType && utils.DOMContains(d[r], s)) {
                                p.push(s), o = !0;
                                break
                            }
                        o || (d.push(s), m.unmasked.push(s), g = !0)
                    }
            } else if (a.selectiveMaskZones && (e = c.querySelectorAll(a.selectiveMaskZones), 0 < (t = Array.prototype.filter.call(e, function(e) {
                return -1 == l.indexOf(e) && -1 == p.indexOf(e)
            })).length))
            for (n = 0, i = t.length; n < i; n++) {
                for (s = t[n], o = !1, r = l.length - 1; 0 <= r; r--)
                    if (1 === l[r].nodeType && utils.DOMContains(l[r], s)) {
                        p.push(s), o = !0;
                        break
                    }
                o || (l.push(s), m.masked.push(s), g = !0)
            }
        if (a.visibleInputs && (e = c.querySelectorAll("input, select, textarea") || [], 0 < (t = Array.prototype.filter.call(e, function(e) {
                var t = !1;
                return void 0 !== e.matches ? t = e.matches(a.visibleInputs) : void 0 !== e.msMatchesSelector ? t = e.msMatchesSelector(a.visibleInputs) : void 0 !== e.matchesSelector && (t = e.matchesSelector(a.visibleInputs)), t && -1 == f.indexOf(e)
            })).length))
            for (n = t.length - 1; 0 <= n; n--) s = t[n], f.push(s), m.whitelist.push(s), g = !0;
        if (a.redactZones && (e = c.querySelectorAll(a.redactZones), 0 < (t = Array.prototype.filter.call(e, function(e) {
                return -1 == u.indexOf(e)
            })).length))
            for (n = t.length - 1; 0 <= n; n--) s = t[n], u.push(s), m.redact.push(s), g = !0;
        return m.hasChanges = g, m
    }, A.prototype.dispose = function() {};
    var N = {
            DOM_SERIALIZE: 0,
            FRAME_SIZE: 2,
            FRAME_SCROLL: 3,
            MOUSE_MOVE: 4,
            WINDOW_MOUSEOUT_MOUSEENTER: 5,
            INPUT_SERIALIZE: 6,
            FOCUS_BLUR: 7,
            KEY_PRESS: 8,
            CARET_INFO: 9,
            ATTR_MODIFIED: 12,
            JAVASCRIPT_ERROR: 13,
            MOUSE_CLICK: 14,
            MOUSE_DOWN: 15,
            MOUSE_UP: 16,
            PAGE_MARKER: 17,
            DOC_SIZE: 18,
            SCROLL_EL: 19,
            NOT_RECORDED: 20,
            CSS_SERIALIZE: 21,
            ORIENTATION: 22,
            ZOOM: 23,
            TOUCH: 24,
            ORIENTATION_CHANGE: 26,
            CUSTOM_BEHAVIOR: 27,
            CUSTOM_ERROR: 28,
            HEARTBEAT: 29,
            NODE_ADDED: 30,
            NODE_REMOVED: 31,
            PAGE_VISIBLE: 32,
            INPUT_RESIZE: 33,
            CHAR_DATA: 34,
            MOD_LIST: 37,
            NODE_MOVED: 38,
            PAGE_ERROR: 40,
            ASSET_ERROR: 41,
            MASKING_CHANGE: 42
        },
        R = function(e, t, i, s, n, r, o, a, c, h, d, l, u) {
            if (fs.ext(this, {
                    browser: t,
                    config: r,
                    stg: e,
                    win: i,
                    ready: new utils.FSEvent,
                    isIframeMode: !!a,
                    recordParent: n,
                    instancePath: s,
                    iFrameParentFr: h,
                    ifrid: c,
                    skipPage: u
                }, !1), this.win.document) {
                if (this.sesh = n && n.sesh ? n.sesh : new C(e, r), this.sesh.DONOTRECORD) return;
                if (this.sesh.endSessionEvent.subscribe(this.dispose.bind(this)), u || (this.masker = new A(r.advancedSettings.pii, this.win), this.masker.updateMaskingTargets()), this.worker = n && n.worker ? n.worker : new M(r, this.sesh, e, this.masker), u) {
                    var p = this.win.location.href.toString();
                    this.worker.queueAction(N.PAGE_MARKER, {
                        ctx: this.getPath(),
                        parent: this.recordParent ? this.recordParent.instancePath : 0,
                        dt: null,
                        doc: null,
                        url: p,
                        v: this.browser.agent,
                        start: fs.startTS,
                        tz: (new Date).getTimezoneOffset(),
                        domloadtime: utils.now() - fs.startTS,
                        cid: r.clientId,
                        customerId: fs.config.customerId,
                        userId: this.getTop().stg.uid,
                        f: document.referrer.toString(),
                        t: document.title,
                        bn: this.browser.name,
                        bv: this.browser.version,
                        dw: 0,
                        dh: 0,
                        pw: 0,
                        ph: 0,
                        lw: 0,
                        lh: 0,
                        vw: 0,
                        vh: 0,
                        landscape: null,
                        mobile: this.browser.isMobile,
                        whiteListMode: null,
                        sid: this.getSessionId(),
                        gid: this.getGlobalId(),
                        vs: !0,
                        scroll: {
                            x: 0,
                            y: 0
                        }
                    }), fs.nextTick(function() {
                        this.worker.queueAction(N.NOT_RECORDED, {
                            ctx: this.getPath()
                        }), this.worker.flush()
                    }.bind(this))
                } else this.cap = new O(t, this.config, this.isIframeMode, this.getTop() === this, i, this.masker, this.worker, this, s, o);
                this.ready.fire()
            }
        };
    R.prototype.getTop = function() {
        return this.recordParent ? this.recordParent.getTop() : this
    }, R.prototype.getPath = function() {
        return this.instancePath
    }, R.prototype.getBindNS = function() {
        return "record" + this.getPath()
    }, R.prototype.bind = function(e, t, i, s) {
        utils.Bind(e, this.getBindNS() + ":" + t, i, s)
    }, R.prototype.setTransmitOK = function() {
        this.sesh.setTransmitting()
    }, R.prototype.flush = function() {
        this.worker && this.worker.flush()
    }, R.prototype.clearState = function() {
        this.sesh.clear(), this.dispose()
    }, R.prototype.getGlobalId = function() {
        return this.sesh.getGlobalId()
    }, R.prototype.getSessionId = function() {
        return this.sesh.getSessionId()
    }, R.prototype.getPIIConfig = function() {
        return this.masker && this.masker.piiObj
    }, R.prototype.getMaskingTargets = function() {
        return this.masker && this.masker.getCurrentMaskingTargets()
    }, R.prototype.processImmediately = function(e) {
        (new utils.AjaxTransport).send({
            method: "GET",
            url: fs.config.recUrl + "process/" + fs.enc(this.getGlobalId()) + "?version=" + fs.enc("symlink" == fs.config.codeVer ? "19.7.0" : fs.config.codeVer) + "&delay=" + (e || 0),
            failure: function(e) {}.bind(this),
            success: function(e) {}.bind(this)
        })
    };
    R.prototype.sendCustomEvent = function(e, t, i, s) {
        i = i || t, s = JSON.stringify(s || {}), 256 < i.length && (i = i.substr(0, 256)), 1e4 < s.length && (s = JSON.stringify({
            msg: "Meta object too large"
        })), this.worker.queueAction(e, {
            msg: i,
            meta: s
        })
    }, R.prototype.dispose = function() {
        return !this.disposed && (this.disposed = !0, this.masker && this.masker.dispose(), this.ready.unsubscribeAll(), this.getTop() === this && (this.worker.dispose(), this.sesh.dispose()), this.cap && this.cap.dispose(), utils.Unbind(this.getBindNS() + ":*"), !0)
    };
    var P = {};
    P._apiReady = new utils.FSEvent, fs.API.expose("beginTransmitting", function() {
        P._apiReady.subscribe(function() {
            P._controller.beginTransmitting()
        }, !0, !0)
    }), fs.API.expose("cancelRecord", function() {
        P._apiReady.subscribe(function() {
            P._controller.cancelRecord()
        }, !0, !0)
    }), fs.API.expose("getSession", function(i) {
        i = i || console.table || console.log, P._apiReady.subscribe(function() {
            var e = P._controller.getGlobalId(),
                t = P._controller.getSessionId();
            i({
                gsessionid: e,
                sessionid: t,
                sig: e + "/" + t
            })
        }, !0, !0)
    }), fs.API.expose("Record", {
        getConfig: function(e) {
            (e = e || console.log)(JSON.parse(JSON.stringify(h)))
        },
        process: function() {
            P._apiReady.subscribe(function() {
                P._controller.recorder && (P._controller.recorder.flush(), setTimeout(function() {
                    P._controller.recorder.processImmediately(0)
                }, 1e3))
            }, !0, !0)
        },
        flush: function() {
            P._apiReady.subscribe(function() {
                P._controller.recorder && P._controller.recorder.flush()
            }, !0, !0)
        },
        dashboard: function() {
            P._apiReady.subscribe(function() {
                var e = P._controller.getGlobalId(),
                    t = P._controller.getSessionId(),
                    i = "prod";
                /qa-/.test(fs.config.recUrl) ? i = "qa" : /dev-/.test(fs.config.recUrl) && (i = "dev"), window.open("https://replay-dashboard.foresee.com/" + i + "/" + e + "/" + t, "_blank")
            }, !0, !0)
        },
        getPIIConfig: function(e) {
            e = e || console.table || console.log, P._apiReady.subscribe(function() {
                P._controller.recorder && e(JSON.parse(JSON.stringify(P._controller.recorder.getPIIConfig())))
            }, !0, !0)
        },
        getPIIElements: function(t) {
            t = t || console.log, P._apiReady.subscribe(function() {
                if (P._controller.recorder) {
                    var e = P._controller.recorder.getMaskingTargets() || {};
                    t({
                        selectiveUnMaskZones: e.unmasked,
                        selectiveMaskZones: e.masked,
                        visibleInputs: e.whitelist,
                        redactZones: e.redact
                    })
                }
            }, !0, !0)
        },
        diagnoseCriteria: function(e) {
            e = e || console.table || console.log, P._apiReady.subscribe(function() {
                P._controller.crit && e(P._controller.crit.reasons)
            }, !0, !0)
        },
        error: function(e, t) {
            P._apiReady.subscribe(function() {
                P._controller.sendCustomEvent(N.CUSTOM_ERROR, "ERROR", e, t)
            }, !0, !0)
        },
        event: function(e, t) {
            P._apiReady.subscribe(function() {
                P._controller.sendCustomEvent(N.CUSTOM_BEHAVIOR, "EVENT", e, t)
            }, !0, !0)
        }
    }), P.ready = function(e) {
        P._controller = e, P._apiReady.fire()
    };
    var D = function(e, t) {
        this.config = e, this.browser = t, this.didSkipOnPurpose = !1, this.reasons = {}
    };
    D.prototype.supported = function() {
        var e, o, a, t = this.config.advancedSettings || {},
            i = this.browser,
            s = this.config.blacklist,
            n = this.config.whitelist,
            r = !1,
            c = t.device_type_support,
            h = location.toString();
        if (t.browser_cutoff || (t.browser_cutoff = {}), t.platform_cutoff || (t.platform_cutoff = {}), t.useSessionStorage) {
            if (!utils.SeshStorage.isSupported()) return !(this.reasons.sessionStorageUnsupported = !0);
            this.reasons.sessionStorageUnsupported = !1
        }
        t.browser_cutoff.IE = Math.max(t.browser_cutoff.IE, 11), t.browser_cutoff.Safari = Math.max(t.browser_cutoff.Safari, 8), t.browser_cutoff.Chrome = Math.max(t.browser_cutoff.Chrome, 38), t.browser_cutoff["Chrome Mobile"] = Math.max(t.browser_cutoff["Chrome Mobile"], 38), t.platform_cutoff.Android = Math.max(t.platform_cutoff.Android, 5), ["iPod", "iPhone", "iPad"].forEach(function(e) {
            t.platform_cutoff[e] = Math.max(t.platform_cutoff[e], 8)
        });
        var d = function(e, t, i) {
            var s = i[t];
            switch (t) {
                case "urls":
                case "text":
                    for (o = 0; o < s.length; o++) {
                        if (utils.testAgainstSearch(s[o], h)) return this.reasons[e + "_" + t + "_" + o] = !0;
                        this.reasons[e + "_" + t + "_" + o] = !1
                    }
                    break;
                case "variables":
                    for (o = 0; o < s.length; o++)
                        if (fs.isDefined(s[o].name)) {
                            if (a = utils.retrieveNestedVariable(l, s[o].name), s[o].value === a) return this.reasons[e + "_" + t + "_" + s[o].name] = !0;
                            if (!0 === a && "true" == s[o].value) return this.reasons[e + "_" + t + "_" + s[o].name] = !0;
                            if (!1 === a && "false" == s[o].value) return this.reasons[e + "_" + t + "_" + s[o].name] = !0;
                            this.reasons[e + "_" + t + "_" + s[o].name] = !1
                        }
                    break;
                case "cookies":
                    var n, r = new utils.Cookie;
                    for (o = 0; o < s.length; o++) {
                        if (n = r.get(s[o].name), fs.isDefined(n) && n == s[o].value) return this.reasons[e + "_" + t + "_" + s[o].name] = !0;
                        this.reasons[e + "_" + t + "_" + s[o].name] = !1
                    }
            }
            return this.reasons[e + "_" + t] = !1
        }.bind(this);
        if (t.browser_cutoff[i.browser.name] && i.browser.actualVersion < t.browser_cutoff[i.browser.name]) return !(this.reasons.browserUnsupported = !0);
        if (this.reasons.browserUnsupported = !1, t.platform_cutoff[i.os.name] && i.os.version < t.platform_cutoff[i.os.name]) return !(this.reasons.platformUnsupported = !0);
        if (this.reasons.platformUnsupported = !1, c && (!c.desktop && !i.isMobile || !c.tablet && i.isTablet || !c.phone && i.isMobile && !i.isTablet)) return !(this.reasons.deviceTypeUnsupported = !0);
        if (this.reasons.deviceTypeUnsupported = !1, s)
            for (e in s)
                if (d("blacklist", e, s)) return this.didSkipOnPurpose = !0, !(this.reasons.blacklistMatched = !0);
        if (this.reasons.blacklistMatched = !1, n) {
            for (e in n)
                if (d("whitelist", e, n)) {
                    r = !0;
                    break
                }
            if (!r) return this.didSkipOnPurpose = !0, !(this.reasons.whitelistNotMatched = !0)
        }
        for (this.reasons.whitelistNotMatched = !1, e = 0; e < t.device_blacklist.length; e++)
            if (-1 < fs.toLowerCase(i.agent).indexOf(t.device_blacklist[e].toLowerCase())) return !(this.reasons.deviceBlacklisted = !0);
        return !(this.reasons.deviceBlacklisted = !1)
    };
    var o = null;

    function U() {
        var e = arguments[2];
        this.jrny = n.jrny = new utils.Journey({
            customerId: fs.config.customerId || utils.getRootDomain() || "record_customerId",
            appId: utils.APPID.REPLAY,
            stg: e,
            browser: arguments[0],
            useSessionId: !0,
            usePopupId: !1
        }), this.jrny.addEventsDefault("properties", {
            fs_pageViews: [e.get("pv")]
        }), this.initialize.apply(this, arguments)
    }
    return U.prototype.isIframe = function() {
        return window != window.top
    }, U.prototype.isCrossDomainFrame = function() {
        if (this.isIframe()) try {
            return window.top.document.body.toString().length.length < 0
        } catch (e) {
            return !0
        }
        return !1
    }, U.prototype.initialize = function(s, n, r, e, o) {
        if ("undefined" != typeof Uint8Array) {
            var t = this.isIframe(),
                a = this.isCrossDomainFrame();
            if (!t || a) {
                if (e && fs.ext(h.advancedSettings || {}, e), this.winobj = n, this.browser = s, h && h.instances)
                    for (var i = 0; i < h.instances.length; i++) {
                        var c = h.instances[i];
                        if (!c.disabled) {
                            fs.ext(h, c);
                            break
                        }
                    }
                this.crit = new D(h, s), (this.stg = r).ready.subscribe(function() {
                    s.ready.subscribe(function() {
                        if (this.crit.supported() || this.crit.didSkipOnPurpose) {
                            var i = this.stg.get(["pv"]);
                            a ? utils.Bind(window, "message", function(e) {
                                if (e.data = e.data + "", e.data && fs.isFunction(e.data.indexOf) && 3 < e.data.length && -1 < e.data.indexOf("{")) {
                                    var t;
                                    try {
                                        t = JSON.parse(e.data)
                                    } catch (e) {
                                        return
                                    }
                                    t.src && "fsframe" == t.src || (t.cxr && t.id ? (this.recorder = new R(r, s, n, t.xp, null, h, null, a, t.id, e.source, t.sid, t.sp), this.recorder.ready.subscribe(function() {
                                        o.set("replay_id", this.recorder.getGlobalId()), o.set("sessionid", this.recorder.getSessionId()), P.ready(this)
                                    }.bind(this), !0, !0), i.rt || "x" !== i.i || this.beginTransmitting(), utils.Bind(window, "unload", function() {
                                        if (this.recorder) {
                                            var e = this.recorder.ifrid;
                                            window.top.postMessage({
                                                unloadiFrame: !0,
                                                frameId: e
                                            }, "*"), this.recorder.dispose(), delete this.recorder
                                        }
                                    }.bind(this))) : t.cxsp && this.recorder && this.recorder.setXFrameScrollPosition(t.sp))
                                }
                            }.bind(this)) : (this.recorder = new R(r, s, n, 0, null, h, null, a, null, null, null, null, !!this.crit.didSkipOnPurpose), this.recorder.ready.subscribe(function() {
                                o.set("replay_id", this.recorder.getGlobalId()), o.set("sessionid", this.recorder.getSessionId()), P.ready(this)
                            }.bind(this), !0, !0), this.jrny && 1 === i.pv && this.jrny.addEventString(d), utils.Bind(window, "beforeunload", function() {
                                this.recorder && (this.recorder.dispose(), delete this.recorder)
                            }.bind(this)))
                        } else P.ready(this)
                    }.bind(this), !0, !0)
                }.bind(this), !0, !0)
            }
        } else this.jrny && this.jrny.addEventString(u)
    }, U.prototype.beginTransmitting = function() {
        this.recorder && this.recorder.setTransmitOK()
    }, U.prototype.dispose = function() {
        this.recorder && (this.recorder.dispose(), delete this.recorder, o = null)
    }, U.prototype.cancelRecord = function() {
        this.recorder && (this.recorder.clearState(), delete this.recorder), this.jrny && this.jrny.addEventString(t)
    }, U.prototype.getGlobalId = function() {
        return this.recorder && this.recorder.getGlobalId()
    }, U.prototype.getSessionId = function() {
        return this.recorder && this.recorder.getSessionId()
    }, U.prototype.sendCustomEvent = function(e, t, i, s) {
        return this.recorder && this.recorder.sendCustomEvent(e, t, i, s)
    }, U.getInstance = function(e, t, i, s, n) {
        return null === o && (o = new U(e, t, i, s, n)), o
    }, U.disposeInstance = function() {
        o && (o.dispose(), o = null)
    }, U
});