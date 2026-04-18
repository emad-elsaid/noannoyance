import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

export default class NoAnnoyanceExtension extends Extension {
  enable() {
    this._settings = this.getSettings('org.gnome.shell.extensions.noannoyance');
    
    // Store the original handler method
    this._originalOnWindowDemandsAttention = Main.windowAttentionHandler._onWindowDemandsAttention;
    
    // Replace the handler's method with our own
    Main.windowAttentionHandler._onWindowDemandsAttention = this._onWindowDemandsAttention.bind(this);
  
    console.log("Disabling 'Window Is Ready' Notification");
  }

  _onWindowDemandsAttention(display, window) {
    if (!window || window.has_focus() || window.is_skip_taskbar())
      return;

    let preventDisable = this._settings.get_boolean('enable-ignorelist');
    let byClassList = this._settings.get_strv('by-class');

    if (preventDisable) {
      if (byClassList.includes(window.get_wm_class())) {
        console.log(`Ignored "${window.get_wm_class()}"s Request to Steal Focus`);
        return;
      }
    }

    Main.activateWindow(window);
  }

  disable() {
    // Restore the original handler method
    if (this._originalOnWindowDemandsAttention) {
      Main.windowAttentionHandler._onWindowDemandsAttention = this._originalOnWindowDemandsAttention;
      this._originalOnWindowDemandsAttention = null;
    }
    
    this._settings = null;
    console.log("Reenabling 'Window Is Ready' Notification");
  }
}