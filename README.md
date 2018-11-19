
# react-native-asyncstorage-queue

## Getting started

`$ npm install react-native-asyncstorage-queue --save`

### Mostly automatic installation

`$ react-native link react-native-asyncstorage-queue`

### Manual installation


#### Android

1. Open up `android/app/src/main/java/[...]/MainActivity.java`
  - Add `import com.blur.module.ReactNativeAsyncstorageQueuePackage;` to the imports at the top of the file
  - Add `new ReactNativeAsyncstorageQueuePackage()` to the list returned by the `getPackages()` method
2. Append the following lines to `android/settings.gradle`:
  	```
  	include ':react-native-asyncstorage-queue'
  	project(':react-native-asyncstorage-queue').projectDir = new File(rootProject.projectDir, 	'../node_modules/react-native-asyncstorage-queue/android')
  	```
3. Insert the following lines inside the dependencies block in `android/app/build.gradle`:
  	```
      compile project(':react-native-asyncstorage-queue')
  	```


## Usage
```javascript
import ReactNativeAsyncstorageQueue from 'react-native-asyncstorage-queue';

// TODO: What to do with the module?
ReactNativeAsyncstorageQueue;
```
