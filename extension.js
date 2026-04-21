import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

export default class NoAnnoyanceExtension extends Extension {
  enable() {
    this._settings = this.getSettings('org.gnome.shell.extensions.noannoyance');
    this._handler = Main.windowAttentionHandler;

    // Disconnect the built-in handler's signals from global.display so it no longer
    // shows the "Window is ready" notification.
    global.display.disconnectObject(this._handler);

    // Re-wire the same signals to our own handler instead.
    global.display.connectObject(
      'window-demands-attention', this._onWindowDemandsAttention.bind(this),
      'window-marked-urgent', this._onWindowDemandsAttention.bind(this),
      this);

    console.log("Disabling 'Window Is Ready' Notification");
  }

  _onWindowDemandsAttention(display, window) {
    if (!window || window.has_focus() || window.is_skip_taskbar())
      return;

    const preventDisable = this._settings.get_boolean('enable-ignorelist');
    const byClassList = this._settings.get_strv('by-class');

    if (preventDisable && byClassList.includes(window.get_wm_class())) {
      console.log(`Ignored "${window.get_wm_class()}"s Request to Steal Focus`);
      return;
    }

    Main.activateWindow(window);
  }

  disable() {
    // Remove our handler.
    global.display.disconnectObject(this);

    // Restore the original handler's signals.
    if (this._handler) {
      global.display.connectObject(
        'window-demands-attention', this._handler._onWindowDemandsAttention.bind(this._handler),
        'window-marked-urgent', this._handler._onWindowDemandsAttention.bind(this._handler),
        this._handler);
      this._handler = null;
    }

    this._settings = null;
    console.log("Reenabling 'Window Is Ready' Notification");
  }
}
