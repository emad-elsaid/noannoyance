// Based on https://github.com/ubuntu/gnome-shell-extension-appindicator

import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';
import GObject from 'gi://GObject';

import {ExtensionPreferences} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

const WMCLASS_LIST = 'by-class';
const IGNORELIST_ENABLED = 'enable-ignorelist';

export default class NoAnnoyancePreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings('org.gnome.shell.extensions.noannoyance');

        const page = new Adw.PreferencesPage();
        const group = new Adw.PreferencesGroup({
            title: 'NoAnnoyance Settings',
        });
        page.add(group);

        // Enable Ignorelist Toggle
        const ignorelistRow = new Adw.ActionRow({
            title: 'Enable Ignorelist',
            subtitle: 'Prevent specific applications from stealing focus',
        });

        const toggle = new Gtk.Switch({
            active: settings.get_boolean(IGNORELIST_ENABLED),
            valign: Gtk.Align.CENTER,
        });

        settings.bind(
            IGNORELIST_ENABLED,
            toggle,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );

        ignorelistRow.add_suffix(toggle);
        ignorelistRow.activatable_widget = toggle;
        group.add(ignorelistRow);

        // WM_CLASS List Section
        const listGroup = new Adw.PreferencesGroup({
            title: 'WM_CLASS List',
            description: 'Applications in this list will NOT have focus stolen\n("Alt + F2" > Run "lg" > Click "Windows" to find WM_CLASS)',
        });
        page.add(listGroup);

        // Create a scrolled window for the list
        const scrolled = new Gtk.ScrolledWindow({
            vexpand: true,
            hexpand: true,
            min_content_height: 300,
        });

        const listBox = new Gtk.ListBox({
            selection_mode: Gtk.SelectionMode.NONE,
            css_classes: ['boxed-list'],
        });
        scrolled.set_child(listBox);

        const listFrame = new Gtk.Frame();
        listFrame.set_child(scrolled);
        listGroup.add(listFrame);

        // Populate existing entries
        const updateList = () => {
            // Clear existing rows
            let child = listBox.get_first_child();
            while (child) {
                const next = child.get_next_sibling();
                listBox.remove(child);
                child = next;
            }

            const wmClasses = settings.get_strv(WMCLASS_LIST);
            wmClasses.forEach((wmClass, index) => {
                const row = createWmClassRow(wmClass, index, settings);
                listBox.append(row);
            });

            // Add empty row for new entry
            const addRow = createAddRow(settings, updateList);
            listBox.append(addRow);
        };

        updateList();

        window.add(page);
    }
}

function createWmClassRow(wmClass, index, settings) {
    const row = new Adw.ActionRow({
        title: wmClass,
    });

    const deleteButton = new Gtk.Button({
        icon_name: 'user-trash-symbolic',
        valign: Gtk.Align.CENTER,
        css_classes: ['flat'],
    });

    deleteButton.connect('clicked', () => {
        const wmClasses = settings.get_strv(WMCLASS_LIST);
        wmClasses.splice(index, 1);
        settings.set_strv(WMCLASS_LIST, wmClasses);
    });

    row.add_suffix(deleteButton);
    return row;
}

function createAddRow(settings, updateCallback) {
    const row = new Adw.ActionRow({
        title: 'Add new WM_CLASS',
    });

    const entry = new Gtk.Entry({
        placeholder_text: 'Enter WM_CLASS name',
        valign: Gtk.Align.CENTER,
        hexpand: true,
    });

    const addButton = new Gtk.Button({
        icon_name: 'list-add-symbolic',
        valign: Gtk.Align.CENTER,
        css_classes: ['flat'],
    });

    addButton.connect('clicked', () => {
        const text = entry.get_text().trim();
        if (text) {
            const wmClasses = settings.get_strv(WMCLASS_LIST);
            wmClasses.push(text);
            settings.set_strv(WMCLASS_LIST, wmClasses);
            entry.set_text('');
            updateCallback();
        }
    });

    entry.connect('activate', () => {
        addButton.emit('clicked');
    });

    row.add_suffix(entry);
    row.add_suffix(addButton);
    return row;
}
