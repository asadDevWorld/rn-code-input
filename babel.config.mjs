export default function (api) {
  const isTest = api.env('test');
  return {
    overrides: [
      {
        exclude: /\/node_modules\//,
        presets: ['module:react-native-builder-bob/babel-preset'],
        // Worklets are compiled by the consuming app's Babel. Only Jest needs the plugin here.
        plugins: isTest ? ['react-native-worklets/plugin'] : [],
      },
      {
        include: /\/node_modules\//,
        presets: ['module:@react-native/babel-preset'],
      },
    ],
  };
}
