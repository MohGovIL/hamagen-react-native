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

  // location
  if (self.locationManager == nil)
      self.locationManager = [[CLLocationManager alloc] init];
  self.locationManager.delegate = self;
  self.locationManager.desiredAccuracy = kCLLocationAccuracyBestForNavigation;
  self.locationManager.allowsBackgroundLocationUpdates = YES;
  self.locationManager.distanceFilter = kCLDistanceFilterNone;
  self.locationManager.pausesLocationUpdatesAutomatically = NO;
  // update location will start on bleStart.
  
  // Background Fetch ( deprecated )
  [application setMinimumBackgroundFetchInterval: UIApplicationBackgroundFetchIntervalMinimum];

  // BGTask
  if (@available(iOS 13.0, *)) {
      NSLog(@"registering bg tasks");
      [self registerProcessingTask];
      [self registerAppRefreshTask];
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

-(void)registerProcessingTask {
    if (@available(iOS 13.0, *)) {
        BOOL res = [[BGTaskScheduler sharedScheduler] registerForTaskWithIdentifier:proccessTaskID
                                                                      usingQueue:nil
                                                                   launchHandler:^(BGTask *task) {
                    [self handleProcessingTask:task];
                }];
      if (!res)
        NSLog(@"failed registering %@", proccessTaskID);
    }
}

-(void)registerAppRefreshTask {
    if (@available(iOS 13.0, *)) {
        BOOL res = [[BGTaskScheduler sharedScheduler] registerForTaskWithIdentifier:refreshTaskID
                                                              usingQueue:nil
                                                           launchHandler:^(BGAppRefreshTask *task) {
            [self handleAppRefreshTask:task];
        }];
      if (!res)
        NSLog(@"failed registering %@", refreshTaskID);
    }
}

-(void)handleProcessingTask:(BGTask *)task API_AVAILABLE(ios(13.0)){
  [self scheduleProcessingTask];
  
  NSOperationQueue* queue = [NSOperationQueue new];
  queue.maxConcurrentOperationCount = 1;
  
  task.expirationHandler = ^{
    [queue cancelAllOperations];
  };
  
  NSOperation* last = queue.operations.lastObject;
  if (last)
  {
    last.completionBlock = ^{
      [task setTaskCompletedWithSuccess:YES];
    };
  }
  
  [queue addOperationWithBlock:^{
//    [[SpecialBleManager sharedManager] writeTestLogToFileForTask:@"BG_Proccessing_handle"];
    [[SpecialBleManager sharedManager] keepAliveBLEStartForTask:@"BGProccessTask"];
  }];
  
  // without NSOperation:
//    //do things with task
//  task.expirationHandler = ^{
//  };
//  [[SpecialBleManager sharedManager] writeTestLogToFileForTask:@"BG_Proccessing_handle"];
//  [[SpecialBleManager sharedManager] keepAliveBLEStartForTask:@"BGProccessTask"];
//  [self scheduleProcessingTask];
//  [task setTaskCompletedWithSuccess:YES];
}

-(void)handleAppRefreshTask:(BGAppRefreshTask *)task API_AVAILABLE(ios(13.0))
{
  [self scheduleAppRefreshTask];

  NSOperationQueue* queue = [NSOperationQueue new];
  queue.maxConcurrentOperationCount = 1;
  
  task.expirationHandler = ^{
    [queue cancelAllOperations];
  };
  
  NSOperation* last = queue.operations.lastObject;
  if (last)
  {
    last.completionBlock = ^{
      [task setTaskCompletedWithSuccess:YES];
    };
  }

  [queue addOperationWithBlock:^{
//    [[SpecialBleManager sharedManager] writeTestLogToFileForTask:@"BG_Refresh_handle"];
    [[SpecialBleManager sharedManager] keepAliveBLEStartForTask:@"BGRefreshTask"];
  }];
}

-(void)scheduleProcessingTask
{
    if (@available(iOS 13.0, *))
    {
        NSError *error = NULL;
        // cancel existing task (if any)
        [BGTaskScheduler.sharedScheduler cancelTaskRequestWithIdentifier:proccessTaskID];
//      [BGTaskScheduler.sharedScheduler cancelAllTaskRequests];
        // new task
        BGProcessingTaskRequest *request = [[BGProcessingTaskRequest alloc] initWithIdentifier:proccessTaskID];
        request.requiresNetworkConnectivity = NO;
        request.requiresExternalPower = NO;
        request.earliestBeginDate = [NSDate dateWithTimeIntervalSinceNow:10*60];
        BOOL success = [[BGTaskScheduler sharedScheduler] submitTaskRequest:request error:&error];
        if (!success) {
//          [[SpecialBleManager sharedManager] writeTestLogToFileForTask:@"BG_Proccess_Schedule_SUCCESS"];
            NSLog(@"Failed to submit proccess request: %@", error);
        } else {
//          [[SpecialBleManager sharedManager] writeTestLogToFileForTask:@"BG_Proccess_Schedule_FAIL"];
            NSLog(@"Success submit proccess request %@", request);
        }
    }
}

-(void)scheduleAppRefreshTask
{
    if (@available(iOS 13.0, *))
    {
      NSError *error = NULL;
      // cancel existing task (if any)
      [BGTaskScheduler.sharedScheduler cancelTaskRequestWithIdentifier:refreshTaskID];

      // new task
      BGAppRefreshTaskRequest* request = [[BGAppRefreshTaskRequest alloc] initWithIdentifier:refreshTaskID];
      request.earliestBeginDate = [NSDate dateWithTimeIntervalSinceNow:15*60];
      BOOL success = [[BGTaskScheduler sharedScheduler] submitTaskRequest:request error:&error];
      if (!success) {
//        [[SpecialBleManager sharedManager] writeTestLogToFileForTask:@"BG_AppRefresh_Schedule_FAIL"];
          NSLog(@"Failed to submit refresh request: %@", error);
      } else {
//        [[SpecialBleManager sharedManager] writeTestLogToFileForTask:@"BG_AppRefresh_Schedule_SUCCESS"];
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

//  [[SpecialBleManager sharedManager] writeTestLogToFileForTask:@"BG_Fetch"];
  [[SpecialBleManager sharedManager] keepAliveBLEStartForTask:@"BGFetch"];

    // if ok...
  completionHandler(UIBackgroundFetchResultNewData);

    // or             completionHandler(UIBackgroundFetchResultNoData);
    // or             completionHandler(UIBackgroundFetchResultFailed);
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
    [[SpecialBleManager sharedManager] keepAliveBLEStartForTask:@"BG_didEnterKeepAlive"];

//    [[SpecialBleManager sharedManager] writeTestLogToFileForTask:@"BG_didEnterBackground"];

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
    [[SpecialBleManager sharedManager] keepAliveBLEStartForTask:@"BG_WillTerminate"];
    
//    [[SpecialBleManager sharedManager] writeTestLogToFileForTask:@"BG_WillTerminate"];
//
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
