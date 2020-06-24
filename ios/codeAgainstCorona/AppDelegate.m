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
#import <BackgroundTasks/BackgroundTasks.h>

@implementation AppDelegate
{
  BOOL didStartBle;
}

static NSString* refreshTaskID = @"com.hamagen.appRefresh";
static NSString* proccessTaskID = @"com.hamagen.appProccess";

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(bleStarted:)
                                               name:@"BLE_Started"
                                             object:nil];
  [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(bleStoped:)
                                               name:@"BLE_Stoped"
                                             object:nil];

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

//  // location
  if (self.locationManager == nil)
      self.locationManager = [[CLLocationManager alloc] init];
  self.locationManager.delegate = self;
  self.locationManager.desiredAccuracy = kCLLocationAccuracyBestForNavigation;
  self.locationManager.allowsBackgroundLocationUpdates = YES;
  self.locationManager.distanceFilter = kCLDistanceFilterNone;
  self.locationManager.pausesLocationUpdatesAutomatically = NO;
//  self.locationManager.activityType = CLActivityTypeOther;
//  [self.locationManager startUpdatingLocation];

  // Background Fetch
  [application setMinimumBackgroundFetchInterval: UIApplicationBackgroundFetchIntervalMinimum];

  // BGTask
  if (@available(iOS 13.0, *)) {
      NSLog(@"configureProcessingTask");
      [self configureProcessingTask];
      [self configureAppRefreshTask];
  }
  
  return YES;
}

#pragma mark - NSNotification

-(void) bleStarted: (NSNotification*) notification
{
  [self.locationManager requestAlwaysAuthorization];
  [self.locationManager startUpdatingLocation];

  didStartBle = YES;
}

-(void) bleStoped: (NSNotification*) notification
{
  [self.locationManager stopUpdatingLocation];
}

#pragma mark - BGTask

-(void)configureProcessingTask {
    if (@available(iOS 13.0, *)) {
        [[BGTaskScheduler sharedScheduler] registerForTaskWithIdentifier:proccessTaskID
                                                              usingQueue:nil
                                                           launchHandler:^(BGTask *task) {
            [self scheduleLocalNotifications];
            [self handleProcessingTask:task];
        }];
    } else {
        // No fallback
    }
}

-(void)configureAppRefreshTask {
    if (@available(iOS 13.0, *)) {
        [[BGTaskScheduler sharedScheduler] registerForTaskWithIdentifier:refreshTaskID
                                                              usingQueue:nil
                                                           launchHandler:^(BGAppRefreshTask *task) {
            [self scheduleLocalNotifications];
            [self handleAppRefreshTask:task];
        }];
    } else {
        // No fallback
    }
}

-(void)scheduleLocalNotifications {
    //do things
  [[SpecialBleManager sharedManager] keepAliveBLEStartForTask:@"LocalNotification"];
}

-(void)handleProcessingTask:(BGTask *)task API_AVAILABLE(ios(13.0)){
    //do things with task
  task.expirationHandler = ^{
    [[SpecialBleManager sharedManager] keepAliveBLEStartForTask:@"BGProccessTask"];
  };
  
  [[SpecialBleManager sharedManager] keepAliveBLEStartForTask:@"BGProccessTask"];
  [self scheduleProcessingTask];
  [task setTaskCompletedWithSuccess:YES];
}

-(void)handleAppRefreshTask:(BGAppRefreshTask *)task API_AVAILABLE(ios(13.0)){
  task.expirationHandler = ^{
    [[SpecialBleManager sharedManager] keepAliveBLEStartForTask:@"BGAppRefreshTask"];
  };

  [[SpecialBleManager sharedManager] keepAliveBLEStartForTask:@"BGAppRefreshTask"];
  [self scheduleAppRefreshTask];
  [task setTaskCompletedWithSuccess:YES];
}

-(void)scheduleProcessingTask
{
    if (@available(iOS 13.0, *))
    {
        NSError *error = NULL;
        // cancel existing task (if any)
        [BGTaskScheduler.sharedScheduler cancelTaskRequestWithIdentifier:proccessTaskID];
        // new task
        BGProcessingTaskRequest *request = [[BGProcessingTaskRequest alloc] initWithIdentifier:proccessTaskID];
        request.requiresNetworkConnectivity = NO;
        request.requiresExternalPower = NO;
        request.earliestBeginDate = [NSDate dateWithTimeIntervalSinceNow:60];
        BOOL success = [[BGTaskScheduler sharedScheduler] submitTaskRequest:request error:&error];
        if (!success) {
            NSLog(@"Failed to submit proccess request: %@", error);
        } else {
            NSLog(@"Success submit proccess request %@", request);
        }
    }
}

-(void)scheduleAppRefreshTask
{
    if (@available(iOS 13.0, *))
    {
      NSError *error = NULL;
      [BGTaskScheduler.sharedScheduler cancelTaskRequestWithIdentifier:refreshTaskID];

      BGAppRefreshTaskRequest* request = [[BGAppRefreshTaskRequest alloc] initWithIdentifier:refreshTaskID];
      request.earliestBeginDate = [NSDate dateWithTimeIntervalSinceNow:50];
      BOOL success = [[BGTaskScheduler sharedScheduler] submitTaskRequest:request error:&error];
      if (!success) {
          NSLog(@"Failed to submit refresh request: %@", error);
      } else {
          NSLog(@"Success submit refresh request %@", request);
      }
    }
}

#pragma mark - Backgound fetch

-(void)application:(UIApplication *)application performFetchWithCompletionHandler:(nonnull void (^)(UIBackgroundFetchResult))completionHandler
{
    NSInteger n = application.applicationIconBadgeNumber;
    application.applicationIconBadgeNumber = n+1;

    // we invoke an sync method, so we should call handler AFTER getting answer...

  [[SpecialBleManager sharedManager] keepAliveBLEStartForTask:@"BGFetch"];

    // if ok...
//  completionHandler(UIBackgroundFetchResultNewData);

    // or             completionHandler(UIBackgroundFetchResultNoData);
    // or             completionHandler(UIBackgroundFetchResultFailed);

  NSString *urlString = [NSString stringWithFormat:
         @"http://api.openweathermap.org/data/2.5/weather?q=%@",
         @"Singapore"];
  
     NSURLSession *session = [NSURLSession sharedSession];
     [[session dataTaskWithURL:[NSURL URLWithString:urlString]
             completionHandler:^(NSData *data,
                                 NSURLResponse *response,
                                 NSError *error) {
                 NSHTTPURLResponse *httpResp = (NSHTTPURLResponse*) response;
                 if (!error && httpResp.statusCode == 200) {
                     //---print out the result obtained---
                     NSString *result =
                     [[NSString alloc] initWithBytes:[data bytes]
                                              length:[data length]
                                            encoding:NSUTF8StringEncoding];
                     NSLog(@"%@", result);
                     
//                     //---parse the JSON result---
//                     [self parseJSONData:data];
//
//                     //---update the UIViewController---
//                     BGAppRefreshViewController *vc =
//                         (BGAppRefreshViewController *)
//                         [[[UIApplication sharedApplication] keyWindow]
//                         rootViewController];
//                     dispatch_sync(dispatch_get_main_queue(), ^{
//                         vc.lblStatus.text = self.temperature;
//                     });
                   
                     [[SpecialBleManager sharedManager] keepAliveBLEStartForTask:@"BGFetch"];
                     completionHandler(UIBackgroundFetchResultNewData);
                     NSLog(@"Background fetch completed...");
                 } else {
                     NSLog(@"%@", error.description);
                     completionHandler(UIBackgroundFetchResultFailed);
                     NSLog(@"Background fetch Failed...");
                 }
             }
      ] resume
     ];
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
  
  [[SpecialBleManager sharedManager] keepAliveBLEStartForTask:@"Update Location"];
}

//- (void)locationManager:(CLLocationManager *)manager didUpdateHeading:(CLHeading *)newHeading
//{
//  NSLog(@"didUpdateHeading");
//}


//-(void)outputAccelertionData:(CMAcceleration)acceleration{
//
//}

#pragma mark - Lifecycle methods

- (void)applicationWillResignActive:(UIApplication *)application {
    // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
    // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
}


- (void)applicationDidEnterBackground:(UIApplication *)application {
    // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
    // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    
  if (didStartBle)
  {
    [self.locationManager stopUpdatingLocation];
    [[SpecialBleManager sharedManager] keepAliveBLEStartForTask:@"BGEnterKeepAlive"];

    if (@available(iOS 13.0, *)) {
        NSLog(@"scheduleProcessingTask");
        [self scheduleProcessingTask];
        NSLog(@"scheduleRefreshTask");
        [self scheduleAppRefreshTask];
    }
//    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
//
//      UIBackgroundTaskIdentifier bgTask = 0;
//
//      bgTask = [[UIApplication sharedApplication] beginBackgroundTaskWithExpirationHandler:^
//                {
//        [[SpecialBleManager sharedManager] keepAliveBLEStartForTask:@"BGTask"];
//
//        [[UIApplication sharedApplication] endBackgroundTask:bgTask];
//      }];
//    });
//
//
    
  }
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
  if (didStartBle)
  {
    [self.locationManager stopUpdatingLocation];
    [[SpecialBleManager sharedManager] keepAliveBLEStartForTask:@"BGTask"];
    
    if (@available(iOS 13.0, *)) {
        NSLog(@"scheduleProcessingTask");
        [self scheduleProcessingTask];
        NSLog(@"scheduleRefreshTask");
        [self scheduleAppRefreshTask];
    }
  }
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
