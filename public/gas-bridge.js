(function () {
  if (window.google && window.google.script && window.google.script.run) return;
  function errorObject(err) {
    if (err && typeof err === 'object' && err.message) return err;
    return { message: String(err || 'Không kết nối được máy chủ.') };
  }
  function makeRunner(successHandler, failureHandler) {
    return new Proxy({}, {
      get: function (_target, prop) {
        if (prop === 'withSuccessHandler') return function (fn) { return makeRunner(fn, failureHandler); };
        if (prop === 'withFailureHandler') return function (fn) { return makeRunner(successHandler, fn); };
        if (prop === 'then') return undefined;
        return function () {
          var args = Array.prototype.slice.call(arguments);
          fetch('/api/gas', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ action: String(prop), args: args }),
            cache: 'no-store'
          }).then(async function (res) {
            var data;
            try { data = await res.json(); }
            catch (_e) { throw new Error('Máy chủ trả về dữ liệu không hợp lệ.'); }
            if (!res.ok || !data.ok) throw new Error((data && data.error && data.error.message) || 'Yêu cầu thất bại.');
            if (typeof successHandler === 'function') successHandler(data.result);
          }).catch(function (err) {
            if (typeof failureHandler === 'function') failureHandler(errorObject(err));
            else console.error(err);
          });
        };
      }
    });
  }
  window.google = window.google || {};
  window.google.script = window.google.script || {};
  window.google.script.run = makeRunner(null, null);
})();
