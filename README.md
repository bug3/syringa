# [Syringa](https://www.npmjs.com/package/syringa) &middot; [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/bug3/syringa/blob/master/LICENSE) [![npm version](https://img.shields.io/npm/v/react.svg?style=flat)](https://www.npmjs.com/package/syringa)

Syringa is a live injector for frontend development in the browser

* **Quick:** You can develop with your own editor instead of developing on console with Syringa.
* **Live:** Inject your code into web pages with the live reload feature.
* **Auto-Load:** It can work without loading extension.

## Installation

Via npm:

```bash
npm install -g syringa
```

If you get an error like this: **EACCES: permission denied**. The following codes may be useful for you.

-   Installation:

    ```bash
    sudo npm install -g syringa
    ```

-   Change Owner:

    ```bash
    sudo chown -R $USER $(echo $(npm root -g)/syringa)
    ```

## Usage

-   **Create project**:

    ```bash
    syringa create [projectName]
    cd [projectName]
    ```

- **Edit** your code and configuration file(.syringarc.json)

-   **Run project:** ( In project directory )

    ```bash
    syringa run
    ```

-   **Auto-Load:** ( if you have not installed syringa extension in your browser )

    ```bash
    syringa run --auto-load
    ```

## One-Liner Command
-   If **npm** is installed

    ```bash
    npm install -g syringa && syringa create hi-syringa && cd hi-syringa && syringa run --auto-load
    ```

## Load Syringa Extension

- Open the extensions page url("**chrome://extensions**") in the browser.
- Turn on the **Developer mode**.
- Click on the **Load unpacked** button and select the syringa extension directory.
    -   **Get extension path:**

        ```bash
        echo "$(npm root -g)/syringa/extension"
        ```

## Incognito Mode

If you want to use syringa in incognito mode:

* Open the extensions page url("**chrome://extensions**") in the browser.

* Find Syringa Extension and click the **details** button.

* Scroll down and **Allow in incognito**.

## Browser Support

Currently Syringa only works with Google Chrome.

## License

[MIT](https://choosealicense.com/licenses/mit/)
