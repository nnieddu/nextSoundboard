export default class Midi {
  constructor() {
    if (!navigator.requestMIDIAccess)
      return console.log("🎹 MIDI not available");

    this.inputDevices = [];

    navigator
      .requestMIDIAccess()
      .then((access) => {
        access.inputs.forEach((input) => this._connectDevice(input));

        access.addEventListener("statechange", (e) => {
          const device = e.port;
          if (device.type !== "input") return;

          if (device.state === "disconnected")
            console.log(
              `🎹 Disconnected MIDI device '${device.manufacturer} ${device.name}'`
            );

          if (device.state === "connected")
            console.log(
              `🎹 Connected MIDI device '${device.manufacturer} ${device.name}'`
            );
        });

        if (access.inputs.size === 0) console.log("🎹 No MIDI devices found");
      })
      .catch((failure) => {
        console.log("🎹 Can't initialize MIDI", failure);
      });
  }

  _connectDevice(device) {
    device.addEventListener("midimessage", (midiEvent) => {
      // Handle MIDI message here
      if (this.onMidiMessage) {
        this.onMidiMessage(midiEvent);
      }
    });
  }

  // Add a method to set a callback function for MIDI messages
  setMidiMessageHandler(callback) {
    this.onMidiMessage = callback;
  }
}
