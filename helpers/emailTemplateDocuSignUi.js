const emailTemplateDocuSignUi = (btnText, titleString,desString, linkString)=>{
	return `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
    <html data-editor-version="2" class="sg-campaigns" xmlns="http://www.w3.org/1999/xhtml">
    
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1">
        <meta http-equiv="X-UA-Compatible" content="IE=Edge">
    
        <style type="text/css">
            body,
            p,
            div {
                font-family: inherit;
                font-size: 14px;
            }
    
            body {
                color: #000000;
            }
    
            body a {
                color: #1188E6;
                text-decoration: none;
            }
    
            p {
                margin: 0;
                padding: 0;
            }
    
            table.wrapper {
                width: 100% !important;
                table-layout: fixed;
                -webkit-font-smoothing: antialiased;
                -webkit-text-size-adjust: 100%;
                -moz-text-size-adjust: 100%;
                -ms-text-size-adjust: 100%;
            }
    
            img.max-width {
                max-width: 100% !important;
            }
    
            .column.of-2 {
                width: 50%;
            }
    
            .column.of-3 {
                width: 33.333%;
            }
    
            .column.of-4 {
                width: 25%;
            }
    
            ul ul ul ul {
                list-style-type: disc !important;
            }
    
            ol ol {
                list-style-type: lower-roman !important;
            }
    
            ol ol ol {
                list-style-type: lower-latin !important;
            }
    
            ol ol ol ol {
                list-style-type: decimal !important;
            }
    
            @media screen and (max-width:480px) {
    
                .preheader .rightColumnContent,
                .footer .rightColumnContent {
                    text-align: left !important;
                }
    
                .preheader .rightColumnContent div,
                .preheader .rightColumnContent span,
                .footer .rightColumnContent div,
                .footer .rightColumnContent span {
                    text-align: left !important;
                }
    
                .preheader .rightColumnContent,
                .preheader .leftColumnContent {
                    font-size: 80% !important;
                    padding: 5px 0;
                }
    
                table.wrapper-mobile {
                    width: 100% !important;
                    table-layout: fixed;
                }
    
                img.max-width {
                    height: auto !important;
                    max-width: 100% !important;
                }
    
                a.bulletproof-button {
                    display: block !important;
                    width: auto !important;
                    font-size: 80%;
                    padding-left: 0 !important;
                    padding-right: 0 !important;
                }
    
                .columns {
                    width: 100% !important;
                }
    
                .column {
                    display: block !important;
                    width: 100% !important;
                    padding-left: 0 !important;
                    padding-right: 0 !important;
                    margin-left: 0 !important;
                    margin-right: 0 !important;
                }
    
                .social-icon-column {
                    display: inline-block !important;
                }
            }
        </style>
        <link href="https://fonts.googleapis.com/css?family=Viga&display=swap" rel="stylesheet" />
        <style>
            body {
                font-family: 'Viga', sans-serif;
            }
        </style>
    </head>
    
    <body>
        <center class="wrapper" data-link-color="#1188E6"
            data-body-style="font-size:14px; font-family:inherit; color:#000000; background-color:#fff;">
            <div class="webkit">
                <table cellpadding="0" cellspacing="0" border="0" width="100%" class="wrapper" bgcolor="#fff">
                    <tr>
                        <td valign="top" bgcolor="#fff" width="100%">
                            <table width="100%" role="content-container" class="outer" align="center" cellpadding="0"
                                cellspacing="0" border="0">
                                <tr>
                                    <td width="100%">
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                <td>
                                                    <table width="100%" cellpadding="0" cellspacing="0" border="0"
                                                        style="width:100%; max-width:600px;" align="center">
                                                        <tr>
                                                            <td role="modules-container"
                                                                style="padding:0px 0px 0px 0px; color:#000000; text-align:left;"
                                                                bgcolor="#ffffff" width="100%" align="left">
                                                                <table class="module preheader preheader-hide" role="module"
                                                                    data-type="preheader" border="0" cellpadding="0"
                                                                    cellspacing="0" width="100%"
                                                                    style="display: none !important; mso-hide: all; visibility: hidden; opacity: 0; color: transparent; height: 0; width: 0;">
                                                                    <tr>
                                                                        <td role="module-content">
                                                                            <p></p>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                                <table border="0" cellpadding="0" cellspacing="0"
                                                                    align="center" width="100%" role="module"
                                                                    data-type="columns" style="padding:30px 20px 40px 30px;"
                                                                    bgcolor="#eaf4fe" data-distribution="1">
                                                                    <tbody>
                                                                        <tr role="module-content">
                                                                            <td height="100%" valign="top">
                                                                                <table width="550"
                                                                                    style="width:550px; border-spacing:0; border-collapse:collapse; margin:0px 0px 0px 0px;"
                                                                                    cellpadding="0" cellspacing="0"
                                                                                    align="left" border="0" bgcolor=""
                                                                                    class="column column-0">
                                                                                    <tbody>
                                                                                        <tr>
                                                                                            <td
                                                                                                style="padding:0px;margin:0px;border-spacing:0;">
                                                                                                <table class="wrapper"
                                                                                                    role="module"
                                                                                                    data-type="image"
                                                                                                    border="0"
                                                                                                    cellpadding="0"
                                                                                                    cellspacing="0"
                                                                                                    width="100%"
                                                                                                    style="table-layout: fixed;"
                                                                                                    data-muid="b422590c-5d79-4675-8370-a10c2c76af02">
                                                                                                    <tbody>
                                                                                                        <tr>
                                                                                                            <td style="font-size:6px; line-height:10px; padding:0px 0px 0px 0px;"
                                                                                                                valign="top"
                                                                                                                align="left">
                                                                                                                <img class="max-width"
                                                                                                                    border="0"
                                                                                                                    style="display:block; color:#000000; text-decoration:none; font-family:Helvetica, arial, sans-serif; font-size:16px;"
                                                                                                                    width="140"
                                                                                                                    alt=""
                                                                                                                    data-proportionally-constrained="true"
                                                                                                                    data-responsive="false"
                                                                                                                    src="https://mymember.com/static/media/logo.940eab8a.png"
                                                                                                                    />
                                                                                                            </td>
                                                                                                        </tr>
                                                                                                    </tbody>
                                                                                                </table>
                                                                                                <table class="module"
                                                                                                    role="module"
                                                                                                    data-type="text"
                                                                                                    border="0"
                                                                                                    cellpadding="0"
                                                                                                    cellspacing="0"
                                                                                                    width="100%"
                                                                                                    style="table-layout: fixed;"
                                                                                                    data-muid="1995753e-0c64-4075-b4ad-321980b82dfe"
                                                                                                    data-mc-module-version="2019-10-22">
                                                                                                    <tbody>
                                                                                                        <tr>
                                                                                                            <td style="padding:100px 0px 18px 0px; line-height:36px; text-align:inherit;"
                                                                                                                height="100%"
                                                                                                                valign="top"
                                                                                                                bgcolor=""
                                                                                                                role="module-content">
                                                                                                                <div>
                                                                                                                    <div
                                                                                                                        style="font-family: inherit; text-align: inherit">

                                                                                                                        <span
                                                                                                                            style="color: #2191fd; font-size: 40px; font-family: inherit">${titleString}</span>
                                                                                                                    </div>
                                                                                                                    <div>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </td>
                                                                                                        </tr>
                                                                                                    </tbody>
                                                                                                </table>
                                                                                                <table class="module"
                                                                                                    role="module"
                                                                                                    data-type="text"
                                                                                                    border="0"
                                                                                                    cellpadding="0"
                                                                                                    cellspacing="0"
                                                                                                    width="100%"
                                                                                                    style="table-layout: fixed;"
                                                                                                    data-muid="2ffbd984-f644-4c25-9a1e-ef76ac62a549"
                                                                                                    data-mc-module-version="2019-10-22">
                                                                                                    <tbody>
                                                                                                        <tr>
                                                                                                            <td style="padding:18px 20px 20px 0px; line-height:24px; text-align:inherit;"
                                                                                                                height="100%"
                                                                                                                valign="top"
                                                                                                                bgcolor=""
                                                                                                                role="module-content">
                                                                                                                <div>
                                                                                                                    <div
                                                                                                                        style="font-family: inherit; text-align: inherit">

                                                                                                                        <span
                                                                                                                            style="font-size: 24px">${desString}</span>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </td>
                                                                                                        </tr>
                                                                                                    </tbody>
                                                                                                </table>
                                                                                                <table border="0"
                                                                                                    cellpadding="0"
                                                                                                    cellspacing="0"
                                                                                                    class="module"
                                                                                                    data-role="module-button"
                                                                                                    data-type="button"
                                                                                                    role="module"
                                                                                                    style="table-layout:fixed;"
                                                                                                    width="100%"
                                                                                                    data-muid="69fc33ea-7c02-45ed-917a-b3b8a6866e89">
                                                                                                    <tbody>
                                                                                                        <tr>
                                                                                                            <td align="left"
                                                                                                                bgcolor=""
                                                                                                                class="outer-td"
                                                                                                                style="padding:0px 0px 0px 0px;">
                                                                                                                <table
                                                                                                                    border="0"
                                                                                                                    cellpadding="0"
                                                                                                                    cellspacing="0"
                                                                                                                    class="wrapper-mobile"
                                                                                                                    style="text-align:center;">
                                                                                                                    <tbody>
                                                                                                                        <tr>
                                                                                                                            <td align="center"
                                                                                                                                bgcolor="#000000"
                                                                                                                                class="inner-td"
                                                                                                                                style="border-radius:6px; font-size:16px; text-align:left; background-color:inherit;">
                                                                                                                                <a href=${linkString}
                                                                                                                                    style="background-color:#2191fd; border:1px solid #2191fd; border-color:#2191fd; border-radius:0px; border-width:1px; color:#fff; display:inline-block; font-size:18px; font-weight:normal; letter-spacing:0px; line-height:normal; padding:12px 18px 12px 18px; text-align:center; text-decoration:none; border-style:solid; font-family:inherit;"
                                                                                                                                    target="_blank">${btnText}</a>
                                                                                                                            </td>
                                                                                                                        </tr>
                                                                                                                    </tbody>
                                                                                                                </table>
                                                                                                            </td>
                                                                                                        </tr>
                                                                                                    </tbody>
                                                                                                </table>
                                                                                            </td>
                                                                                        </tr>
                                                                                    </tbody>
                                                                                </table>
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
        </center>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </div>
        </center>
    </body>
    
    `
}

module.exports=emailTemplateDocuSignUi;
