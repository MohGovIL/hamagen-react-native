/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import <React/RCTBridgeDelegate.h>
#import <UIKit/UIKit.h>
#import <CoreLocation/CoreLocation.h>
//#import <CoreMotion/CoreMotion.h>

@interface AppDelegate : UIResponder <UIApplicationDelegate, RCTBridgeDelegate, CLLocationManagerDelegate>

@property (nonatomic, strong) UIWindow *window;
//@property (strong, nonatomic) CMMotionManager *motionManager;
@property (nonatomic, strong) CLLocationManager *locationManager;
//@property (nonatomic, strong) CLLocationManager *locationManager1;
//@property (nonatomic, strong) CLLocationManager *locationManager2;
//@property (nonatomic, strong) CLLocationManager *locationManager3;

@end
