FROM ubuntu:18.04

RUN apt-get update && apt-get install -y  --no-install-recommends \
  git \
  curl \
  wget \
  unzip \
  openjdk-8-jdk && \
  rm -rf /var/lib/apt/lists/*

RUN curl -sL https://deb.nodesource.com/setup_13.x | bash - && \
    apt-get update && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /magen/sdk
RUN wget https://dl.google.com/android/repository/commandlinetools-linux-6200805_latest.zip && \
    unzip commandlinetools-linux-6200805_latest.zip && \
    rm commandlinetools-linux-6200805_latest.zip

ENV ANDROID_SDK_ROOT="/magen/sdk"
ENV ANDROID_HOME="${ANDROID_SDK_ROOT}"
ENV PATH="${PATH}:${ANDROID_HOME}/emulator"
ENV PATH="${PATH}:${ANDROID_HOME}/tools"
ENV PATH="${PATH}:${ANDROID_HOME}/tools/bin"
ENV PATH="${PATH}:${ANDROID_HOME}/platform-tools"

RUN yes | $ANDROID_HOME/tools/bin/sdkmanager --sdk_root=${ANDROID_HOME} --licenses
RUN $ANDROID_HOME/tools/bin/sdkmanager --sdk_root=${ANDROID_HOME} --update
RUN $ANDROID_HOME/tools/bin/sdkmanager --sdk_root=${ANDROID_HOME} "platform-tools" "platforms;android-28"

WORKDIR /magen

RUN git clone --depth 1 https://github.com/MohGovIL/hamagen-react-native.git
WORKDIR /magen/hamagen-react-native
RUN npm install
RUN cd android && ./gradlew | true 2>/dev/null

CMD /bin/bash