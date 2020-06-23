/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import "AppDelegate.h"

#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <React/RCTI18nUtil.h>
#import <React/RCTLinkingManager.h>

#import <Firebase.h>
#import "RNFirebaseNotifications.h"
#import "RNFirebaseMessaging.h"
#import "RNSplashScreen.h"

#import <rn-contact-tracing/SpecialBleManager.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
                                                   moduleName:@"codeAgainstCorona"
                                            initialProperties:nil];

  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  
  [[RCTI18nUtil sharedInstance] allowRTL:NO];
  [[RCTI18nUtil sharedInstance] forceRTL:NO];
  
  [FIRApp configure];
  [RNFirebaseNotifications configure];
  
  [RNSplashScreen show];
  
//  self.motionManager = [[CMMotionManager alloc] init];
//   self.motionManager.accelerometerUpdateInterval = 2;
//  self.motionManager.deviceMotionUpdateInterval = 2;
//  [self.motionManager startAccelerometerUpdatesToQueue:[NSOperationQueue currentQueue]
//                                            withHandler:^(CMAccelerometerData  *accelerometerData, NSError *error) {
//                                               [self outputAccelertionData:accelerometerData.acceleration];
//                                                if(error)
//                                                {
//                                                    NSLog(@"%@", error);
//                                                }
//                                            }];
//  [self.motionManager startDeviceMotionUpdatesToQueue:[NSOperationQueue currentQueue] withHandler:^(CMDeviceMotion * _Nullable motion, NSError * _Nullable error) {
//    NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
//    NSString *documentsDirectory = [paths objectAtIndex:0];
//
//    NSString* filepath = [[NSString alloc] init];
//    NSError *err;
//
//    filepath = [documentsDirectory stringByAppendingPathComponent:@"DeviceMotion_logs.txt"];
//
//    NSString *contents = [NSString stringWithContentsOfFile:filepath encoding:(NSStringEncoding)NSUnicodeStringEncoding error:nil] ?: @"";
//
//    NSDate* now = [NSDate date];
//
//
//    NSString* text2log = [NSString stringWithFormat:@"%@\n%@ - check",contents, now ];
//    BOOL ok = [text2log writeToFile:filepath atomically:YES encoding:NSUnicodeStringEncoding error:&err];
//
//  }];

  // location
  if (self.locationManager == nil)
      self.locationManager = [[CLLocationManager alloc] init];
  self.locationManager.delegate = self;
  [self.locationManager requestAlwaysAuthorization];
  self.locationManager.desiredAccuracy = kCLLocationAccuracyBestForNavigation;
  self.locationManager.allowsBackgroundLocationUpdates = YES;
  self.locationManager.distanceFilter = kCLDistanceFilterNone;
  self.locationManager.pausesLocationUpdatesAutomatically = NO;
  self.locationManager.activityType = CLActivityTypeOther;
  [self.locationManager startUpdatingLocation];
//  self.locationManager.headingFilter = kCLHeadingFilterNone;
//  [self.locationManager startUpdatingHeading];
  
//  if (self.locationManager1 == nil)
//      self.locationManager1 = [[CLLocationManager alloc] init];
//  self.locationManager1.delegate = self;
//  [self.locationManager1 requestAlwaysAuthorization];
//  self.locationManager1.desiredAccuracy = kCLLocationAccuracyThreeKilometers;
//  self.locationManager1.allowsBackgroundLocationUpdates = YES;
//  self.locationManager1.distanceFilter = kCLDistanceFilterNone;
//  self.locationManager1.pausesLocationUpdatesAutomatically = NO;
//  self.locationManager1.activityType = CLActivityTypeOther;
//  [self.locationManager1 startUpdatingLocation];
//  self.locationManager1.headingFilter = kCLHeadingFilterNone;
//  [self.locationManager1 startUpdatingHeading];
//
//  if (self.locationManager2 == nil)
//      self.locationManager2 = [[CLLocationManager alloc] init];
//  self.locationManager2.delegate = self;
//  [self.locationManager2 requestAlwaysAuthorization];
//  self.locationManager2.desiredAccuracy = kCLLocationAccuracyBestForNavigation;
//  self.locationManager2.allowsBackgroundLocationUpdates = YES;
//  self.locationManager2.distanceFilter = kCLDistanceFilterNone;
//  self.locationManager2.pausesLocationUpdatesAutomatically = NO;
//  self.locationManager2.activityType = CLActivityTypeAutomotiveNavigation;
//  [self.locationManager2 startUpdatingLocation];
//  self.locationManager2.headingFilter = kCLHeadingFilterNone;
//  [self.locationManager2 startUpdatingHeading];
//
//  if (self.locationManager3 == nil)
//      self.locationManager3 = [[CLLocationManager alloc] init];
//  self.locationManager3.delegate = self;
//  [self.locationManager3 requestAlwaysAuthorization];
//  self.locationManager3.desiredAccuracy = kCLLocationAccuracyBestForNavigation;
//  self.locationManager3.allowsBackgroundLocationUpdates = YES;
//  self.locationManager3.distanceFilter = kCLDistanceFilterNone;
//  self.locationManager3.pausesLocationUpdatesAutomatically = NO;
//  self.locationManager3.activityType = CLActivityTypeOtherNavigation;
//  [self.locationManager3 startUpdatingLocation];
//  self.locationManager3.headingFilter = kCLHeadingFilterNone;
//  [self.locationManager3 startUpdatingHeading];
  
  return YES;
}

#pragma mark - CLLocationManagerDelegate

- (void)locationManager:(CLLocationManager *)manager didFailWithError:(NSError *)error
{
    NSLog(@"didFailWithError: %@", error);
  
}

- (void)locationManager:(CLLocationManager *)manager
     didUpdateLocations:(NSArray *)locations
{
    NSLog(@"didUpdateLocation");
  
  [[SpecialBleManager sharedManager] keepAliveBLEStart];
//    NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
//      NSString *documentsDirectory = [paths objectAtIndex:0];
//
//      NSString* filepath = [[NSString alloc] init];
//      NSError *err;
//
//      filepath = [documentsDirectory stringByAppendingPathComponent:@"didUpdateLocations.txt"];
//
//      NSString *contents = [NSString stringWithContentsOfFile:filepath encoding:(NSStringEncoding)NSUnicodeStringEncoding error:nil] ?: @"";
//
//      NSDate* now = [NSDate date];
//
//
//      NSString* text2log = [NSString stringWithFormat:@"%@\n%@ - check",contents, now ];
//      BOOL ok = [text2log writeToFile:filepath atomically:YES encoding:NSUnicodeStringEncoding error:&err];
}

//- (void)locationManager:(CLLocationManager *)manager didUpdateHeading:(CLHeading *)newHeading
//{
//  NSLog(@"didUpdateHeading");
//  NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
//    NSString *documentsDirectory = [paths objectAtIndex:0];
//
//    NSString* filepath = [[NSString alloc] init];
//    NSError *err;
//
//    filepath = [documentsDirectory stringByAppendingPathComponent:@"didUpdateHeading.txt"];
//
//    NSString *contents = [NSString stringWithContentsOfFile:filepath encoding:(NSStringEncoding)NSUnicodeStringEncoding error:nil] ?: @"";
//
//    NSDate* now = [NSDate date];
//
//
//    NSString* text2log = [NSString stringWithFormat:@"%@\n%@ - check",contents, now ];
//    BOOL ok = [text2log writeToFile:filepath atomically:YES encoding:NSUnicodeStringEncoding error:&err];
//}


//-(void)outputAccelertionData:(CMAcceleration)acceleration{
//
//    NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
//    NSString *documentsDirectory = [paths objectAtIndex:0];
//
//    NSString* filepath = [[NSString alloc] init];
//    NSError *err;
//
//    filepath = [documentsDirectory stringByAppendingPathComponent:@"Acceleration_logs.txt"];
//
//    NSString *contents = [NSString stringWithContentsOfFile:filepath encoding:(NSStringEncoding)NSUnicodeStringEncoding error:nil] ?: @"";
//
//    NSDate* now = [NSDate date];
//    
//
//    NSString* text2log = [NSString stringWithFormat:@"%@\n%@ - check",contents, now ];
//    BOOL ok = [text2log writeToFile:filepath atomically:YES encoding:NSUnicodeStringEncoding error:&err];
//}

#pragma mark - Lifecycle methods

- (void)applicationWillResignActive:(UIApplication *)application {
    // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
    // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
}


- (void)applicationDidEnterBackground:(UIApplication *)application {
    // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
    // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    
    UIBackgroundTaskIdentifier bgTask = 0;
    
    bgTask = [[UIApplication sharedApplication] beginBackgroundTaskWithExpirationHandler:^
              {
                  [[UIApplication sharedApplication] endBackgroundTask:bgTask];
              }];
    
    NSTimeInterval ti = [[UIApplication sharedApplication]backgroundTimeRemaining];
    NSLog(@"backgroundTimeRemaining: %f", ti); // just for debug
    
}


- (void)applicationWillEnterForeground:(UIApplication *)application {
    // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
}


- (void)applicationDidBecomeActive:(UIApplication *)application {
    // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
}


- (void)applicationWillTerminate:(UIApplication *)application {
    // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    NSLog(@"Application will terminate");
}

#pragma mark - notifications

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

- (void)application:(UIApplication *)application didReceiveLocalNotification:(UILocalNotification *)notification {
  [[RNFirebaseNotifications instance] didReceiveLocalNotification:notification];
}

- (void)application:(UIApplication *)application didReceiveRemoteNotification:(nonnull NSDictionary *)userInfo
fetchCompletionHandler:(nonnull void (^)(UIBackgroundFetchResult))completionHandler{
  [[RNFirebaseNotifications instance] didReceiveRemoteNotification:userInfo fetchCompletionHandler:completionHandler];
}

- (void)application:(UIApplication *)application didRegisterUserNotificationSettings:(UIUserNotificationSettings *)notificationSettings {
  [[RNFirebaseMessaging instance] didRegisterUserNotificationSettings:notificationSettings];
}

- (BOOL)application:(UIApplication *)application
   openURL:(NSURL *)url
   options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
  return [RCTLinkingManager application:application openURL:url options:options];
}

@end
